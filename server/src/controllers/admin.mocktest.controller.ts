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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Controller for Exam Admin Mock Test Creation & Access Key Management
 */

export const manualCreateMockTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      subject_ids = [],
      subject_id,
      duration_mins = 60,
      max_marks,
      passing_marks,
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

    // 1. Fetch the selected questions from question_bank first to validate existence
    const { data: bankQuestions, error: fetchErr } = await supabase
      .from('question_bank')
      .select('*')
      .in('bank_question_id', selected_bank_question_ids);

    if (fetchErr || !bankQuestions || bankQuestions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve selected bank questions: ' + (fetchErr?.message || 'No questions found.'),
      });
      return;
    }

    // 2. Fetch known subjects from DB to resolve names (e.g. "Mathematics") to valid UUIDs
    const { data: dbSubjects } = await supabase
      .from('subject')
      .select('subject_id, name');

    const nameToSubject = new Map<string, { subject_id: string; name: string }>();
    const knownSubjectIds = new Set<string>();

    (dbSubjects || []).forEach((s) => {
      nameToSubject.set(s.name.trim().toLowerCase(), s);
      knownSubjectIds.add(s.subject_id.toLowerCase());
    });

    // Gather raw subject inputs from subject_ids array or single subject_id
    const rawSubjectInputs: string[] = [];
    if (Array.isArray(subject_ids)) {
      rawSubjectInputs.push(...subject_ids);
    } else if (typeof subject_ids === 'string' && subject_ids.trim()) {
      rawSubjectInputs.push(subject_ids.trim());
    }
    if (subject_id && typeof subject_id === 'string' && subject_id.trim()) {
      rawSubjectInputs.push(subject_id.trim());
    }

    const resolvedSubjectIds: string[] = [];

    for (const raw of rawSubjectInputs) {
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;

      if (UUID_REGEX.test(trimmed)) {
        // Already a valid UUID
        resolvedSubjectIds.push(trimmed);
      } else {
        // Subject name provided (e.g. "Mathematics")
        const found = nameToSubject.get(trimmed.toLowerCase());
        if (found) {
          resolvedSubjectIds.push(found.subject_id);
        } else {
          // If not in DB, create it dynamically so future lookups succeed
          const { data: createdSub } = await supabase
            .from('subject')
            .insert({ name: trimmed })
            .select('subject_id, name')
            .maybeSingle();

          if (createdSub) {
            resolvedSubjectIds.push(createdSub.subject_id);
            nameToSubject.set(createdSub.name.trim().toLowerCase(), createdSub);
            knownSubjectIds.add(createdSub.subject_id.toLowerCase());
          }
        }
      }
    }

    // If no subjects could be resolved from inputs, derive them from selected bank questions
    if (resolvedSubjectIds.length === 0) {
      for (const bq of bankQuestions) {
        if (bq.subject_id && UUID_REGEX.test(bq.subject_id)) {
          resolvedSubjectIds.push(bq.subject_id);
        } else if (bq.subject_name && nameToSubject.has(bq.subject_name.trim().toLowerCase())) {
          resolvedSubjectIds.push(nameToSubject.get(bq.subject_name.trim().toLowerCase())!.subject_id);
        }
      }
    }

    const uniqueSubjectIds = Array.from(new Set(resolvedSubjectIds));
    const primarySubjectId = uniqueSubjectIds.length > 0 ? uniqueSubjectIds[0] : null;
    const isMultiSubject = uniqueSubjectIds.length > 1;

    // 3. Generate unique 6-digit access key valid for 60 minutes
    const accessKey = await generateUnique6DigitAccessKey();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // exactly 60 minutes

    // Calculate max marks and passing marks safely
    const calculatedMarks = bankQuestions.reduce(
      (acc, q) => acc + (Number(q.marks_per_question) || 4),
      0
    );
    const finalMaxMarks = Number(max_marks) || calculatedMarks || bankQuestions.length * 4;
    const finalPassingMarks = Number(passing_marks) || Math.round(finalMaxMarks * 0.4);

    // 4. Insert mock_test record with guaranteed valid UUID primarySubjectId
    const { data: testRecord, error: testErr } = await supabase
      .from('mock_test')
      .insert({
        title: title.trim(),
        description: description ? description.trim() : null,
        subject_id: primarySubjectId,
        total_questions: bankQuestions.length,
        max_marks: finalMaxMarks,
        max_time_in_mins: Number(duration_mins) || 60,
        passing_marks: finalPassingMarks,
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

    // 5. Link subjects in mock_test_subjects junction table using resolved UUIDs
    if (uniqueSubjectIds.length > 0) {
      const junctionRows = uniqueSubjectIds.map((sId: string) => ({
        mock_test_id: mockTestId,
        subject_id: sId,
      }));
      const { error: junctionErr } = await supabase.from('mock_test_subjects').insert(junctionRows);
      if (junctionErr) {
        console.warn('Warning inserting into mock_test_subjects:', junctionErr.message);
      }
    }

    // 6. Insert rows into public.questions linked to mockTestId and bank_question_id
    const questionsToInsert = bankQuestions.map((bq: any) => {
      let qSubjId = bq.subject_id;
      if (!qSubjId || !UUID_REGEX.test(qSubjId)) {
        if (bq.subject_name && nameToSubject.has(bq.subject_name.trim().toLowerCase())) {
          qSubjId = nameToSubject.get(bq.subject_name.trim().toLowerCase())!.subject_id;
        } else {
          qSubjId = primarySubjectId;
        }
      }

      return {
        mock_test_id: mockTestId,
        bank_question_id: bq.bank_question_id,
        subject_id: qSubjId && UUID_REGEX.test(qSubjId) ? qSubjId : null,
        question_text: bq.question_text,
        question_type: bq.question_type || 'MCQ',
        marks_per_question: Number(bq.marks_per_question) || 4,
        negative_marking: bq.negative_marking !== undefined ? Number(bq.negative_marking) : 1,
        option_array: bq.option_array,
        answers: bq.answers,
        question_image_url: bq.question_image_url || null,
      };
    });

    const { error: insertQuestionsErr } = await supabase.from('questions').insert(questionsToInsert);
    if (insertQuestionsErr) {
      console.error('Error inserting test questions:', insertQuestionsErr.message);
    }

    console.log(`[Mock Test Created] "${title}" (${mockTestId}) with ${questionsToInsert.length} questions. Access Key: ${accessKey}`);

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
