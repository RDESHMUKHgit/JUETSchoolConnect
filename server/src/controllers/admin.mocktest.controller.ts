import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Helper to generate a unique random 6-digit numeric access key
 * Ensures collision avoidance against all currently active, unexpired keys.
 */
async function generateUnique6DigitAccessKey(): Promise<string> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random 6-digit number between 100000 and 999999
    const key = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if this key is already active on an unexpired mock test
    const { data: existing } = await supabase
      .from('mock_test')
      .select('mock_test_id')
      .eq('access_key', key)
      .gt('access_key_expires_at', new Date().toISOString())
      .maybeSingle();

    if (!existing) {
      return key;
    }
  }

  // Fallback timestamp-derived 6 digits if needed
  return (Date.now() % 900000 + 100000).toString();
}

/**
 * Controller for Exam Admin Mock Test Creation & Access Key Management
 */

export const manualCreateMockTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      subject_ids = [],
      duration_mins = 60,
      max_marks = 120,
      passing_marks = 40,
      negative_marking = true,
      selected_bank_question_ids = [],
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Test title is required.' });
      return;
    }

    if (!Array.isArray(selected_bank_question_ids) || selected_bank_question_ids.length === 0) {
      res.status(400).json({ success: false, message: 'Please select at least 1 question from the Question Bank.' });
      return;
    }

    // 1. Generate unique 6-digit access key valid for 60 minutes
    const accessKey = await generateUnique6DigitAccessKey();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // exactly 60 minutes

    // Determine primary subject_id (first selected, or null for multi-subject)
    const primarySubjectId = subject_ids.length > 0 ? subject_ids[0] : null;
    const isMultiSubject = subject_ids.length > 1;

    // 2. Insert mock_test record
    const { data: testRecord, error: testErr } = await supabase
      .from('mock_test')
      .insert({
        title: title.trim(),
        description: description ? description.trim() : null,
        subject_id: primarySubjectId,
        total_questions: selected_bank_question_ids.length,
        max_marks: Number(max_marks) || selected_bank_question_ids.length * 4,
        max_time_in_mins: Number(duration_mins) || 60,
        passing_marks: Number(passing_marks) || 40,
        negative_marking: Boolean(negative_marking),
        access_key: accessKey,
        access_key_created_at: now.toISOString(),
        access_key_expires_at: expiresAt.toISOString(),
        is_multi_subject: isMultiSubject,
      })
      .select()
      .single();

    if (testErr || !testRecord) {
      res.status(400).json({ success: false, message: 'Failed to create mock test: ' + testErr?.message });
      return;
    }

    const mockTestId = testRecord.mock_test_id;

    // 3. Link subjects in mock_test_subjects junction table
    if (subject_ids.length > 0) {
      const junctionRows = subject_ids.map((sId: string) => ({
        mock_test_id: mockTestId,
        subject_id: sId,
      }));
      await supabase.from('mock_test_subjects').insert(junctionRows);
    }

    // 4. Fetch the selected questions from question_bank
    const { data: bankQuestions, error: fetchErr } = await supabase
      .from('question_bank')
      .select('*')
      .in('bank_question_id', selected_bank_question_ids);

    if (fetchErr || !bankQuestions) {
      res.status(400).json({ success: false, message: 'Failed to retrieve selected bank questions: ' + fetchErr?.message });
      return;
    }

    // 5. Insert rows into public.questions linked to mockTestId and bank_question_id
    const questionsToInsert = bankQuestions.map((bq: any) => ({
      mock_test_id: mockTestId,
      bank_question_id: bq.bank_question_id,
      subject_id: bq.subject_id,
      question_text: bq.question_text,
      question_type: bq.question_type || 'MCQ',
      marks_per_question: bq.marks_per_question || 4,
      negative_marking: bq.negative_marking || 1,
      option_array: bq.option_array,
      answers: bq.answers,
      question_image_url: bq.question_image_url,
    }));

    const { error: insertQuestionsErr } = await supabase.from('questions').insert(questionsToInsert);
    if (insertQuestionsErr) {
      console.error('Error inserting test questions:', insertQuestionsErr.message);
    }

    console.log(`[Mock Test Created] "${title}" with ${questionsToInsert.length} questions. Access Key: ${accessKey}`);

    res.status(201).json({
      success: true,
      message: `Mock test created successfully with ${questionsToInsert.length} questions.`,
      mockTest: {
        ...testRecord,
        access_key: accessKey,
        access_key_expires_at: expiresAt.toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateMockTestAccessKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify test exists
    const { data: test, error: fetchErr } = await supabase
      .from('mock_test')
      .select('mock_test_id, title')
      .eq('mock_test_id', id)
      .single();

    if (fetchErr || !test) {
      res.status(404).json({ success: false, message: 'Mock test not found.' });
      return;
    }

    // Generate fresh collision-free 6-digit numeric key
    const newAccessKey = await generateUnique6DigitAccessKey();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 60 mins

    const { data: updated, error: updateErr } = await supabase
      .from('mock_test')
      .update({
        access_key: newAccessKey,
        access_key_created_at: now.toISOString(),
        access_key_expires_at: expiresAt.toISOString(),
      })
      .eq('mock_test_id', id)
      .select()
      .single();

    if (updateErr) {
      res.status(400).json({ success: false, message: 'Failed to update access key: ' + updateErr.message });
      return;
    }

    console.log(`[Access Key Generated] Test "${test.title}" -> 6-Digit Key: ${newAccessKey} (Expires: ${expiresAt.toISOString()})`);

    res.status(200).json({
      success: true,
      message: `New 6-digit access key generated for "${test.title}". Valid for 60 minutes.`,
      accessKey: newAccessKey,
      expiresAt: expiresAt.toISOString(),
      mockTest: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
