import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Controller for Exam Admin Question Bank operations:
 * - Fetching all master questions with "previously asked" cross-referencing
 * - Creating new questions
 * - Editing questions
 * - Safe deletion of questions (protected if previously asked)
 */

export const getQuestionBank = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch all questions from the question bank
    const { data: bankQuestions, error: bankErr } = await supabase
      .from('question_bank')
      .select('*')
      .order('created_at', { ascending: false });

    if (bankErr) {
      res.status(500).json({ success: false, message: 'Failed to fetch question bank: ' + bankErr.message });
      return;
    }

    // 2. Fetch all questions currently linked to mock tests to cross-reference usage
    const { data: activeQuestions, error: activeErr } = await supabase
      .from('questions')
      .select('question_id, bank_question_id, question_text, mock_test:mock_test_id(mock_test_id, title)');

    if (activeErr) {
      console.warn('Note on active questions query:', activeErr.message);
    }

    // Map usage by bank_question_id and by normalized question_text
    const usageByBankId = new Map<string, Array<{ testId: string; title: string }>>();
    const usageByText = new Map<string, Array<{ testId: string; title: string }>>();

    activeQuestions?.forEach((aq: any) => {
      const testInfo = {
        testId: aq.mock_test?.mock_test_id || '',
        title: aq.mock_test?.title || 'Untitled Examination',
      };

      if (aq.bank_question_id) {
        const existing = usageByBankId.get(aq.bank_question_id) || [];
        existing.push(testInfo);
        usageByBankId.set(aq.bank_question_id, existing);
      }

      if (aq.question_text) {
        const normalizedText = aq.question_text.trim().toLowerCase();
        const existing = usageByText.get(normalizedText) || [];
        existing.push(testInfo);
        usageByText.set(normalizedText, existing);
      }
    });

    // 3. Correlate each bank question with its usage history
    const enrichedQuestions = (bankQuestions || []).map((bq: any) => {
      const normalizedBankText = (bq.question_text || '').trim().toLowerCase();
      const usagesFromId = usageByBankId.get(bq.bank_question_id) || [];
      const usagesFromText = usageByText.get(normalizedBankText) || [];

      // Merge and deduplicate usages by testId
      const uniqueUsagesMap = new Map<string, { testId: string; title: string }>();
      [...usagesFromId, ...usagesFromText].forEach((u) => {
        if (u.testId) uniqueUsagesMap.set(u.testId, u);
      });
      const usedInTests = Array.from(uniqueUsagesMap.values());

      return {
        ...bq,
        is_used: usedInTests.length > 0,
        usage_count: usedInTests.length,
        used_in_tests: usedInTests,
      };
    });

    res.status(200).json({
      success: true,
      total: enrichedQuestions.length,
      questions: enrichedQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      question_text,
      subject_name,
      question_type = 'MCQ',
      marks_per_question = 4,
      negative_marking = 1,
      option_array,
      answers,
      explanation,
      difficulty = 'MEDIUM',
      topic,
      question_image_url,
    } = req.body;

    if (!question_text || !question_text.trim()) {
      res.status(400).json({ success: false, message: 'Question text is required.' });
      return;
    }

    if (!option_array || !Array.isArray(option_array) || option_array.length < 2) {
      res.status(400).json({ success: false, message: 'At least 2 options are required.' });
      return;
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ success: false, message: 'Correct answer selection is required.' });
      return;
    }

    // Lookup subject_id by subject_name if available
    let subjectId: string | null = null;
    if (subject_name) {
      const { data: subject } = await supabase
        .from('subject')
        .select('subject_id')
        .ilike('name', subject_name.trim())
        .maybeSingle();

      if (subject) subjectId = subject.subject_id;
    }

    const { data: newQuestion, error: insertErr } = await supabase
      .from('question_bank')
      .insert({
        question_text: question_text.trim(),
        subject_name: (subject_name || 'Mathematics').trim(),
        subject_id: subjectId,
        question_type,
        marks_per_question: Number(marks_per_question) || 4,
        negative_marking: Number(negative_marking) || 1,
        option_array,
        answers,
        explanation: explanation ? explanation.trim() : null,
        difficulty,
        topic: topic ? topic.trim() : null,
        question_image_url: question_image_url || null,
      })
      .select()
      .single();

    if (insertErr) {
      res.status(400).json({ success: false, message: 'Failed to create question: ' + insertErr.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully in Question Bank.',
      question: {
        ...newQuestion,
        is_used: false,
        used_in_tests: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      question_text,
      subject_name,
      marks_per_question,
      negative_marking,
      option_array,
      answers,
      explanation,
      difficulty,
      topic,
      question_image_url,
    } = req.body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (question_text !== undefined) updatePayload.question_text = question_text.trim();
    if (subject_name !== undefined) updatePayload.subject_name = subject_name.trim();
    if (marks_per_question !== undefined) updatePayload.marks_per_question = Number(marks_per_question);
    if (negative_marking !== undefined) updatePayload.negative_marking = Number(negative_marking);
    if (option_array !== undefined) updatePayload.option_array = option_array;
    if (answers !== undefined) updatePayload.answers = answers;
    if (explanation !== undefined) updatePayload.explanation = explanation;
    if (difficulty !== undefined) updatePayload.difficulty = difficulty;
    if (topic !== undefined) updatePayload.topic = topic;
    if (question_image_url !== undefined) updatePayload.question_image_url = question_image_url;

    const { data: updated, error: updateErr } = await supabase
      .from('question_bank')
      .update(updatePayload)
      .eq('bank_question_id', id)
      .select()
      .single();

    if (updateErr) {
      res.status(400).json({ success: false, message: 'Failed to update question: ' + updateErr.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Check if the question is used in any active mock tests
    const { data: usedQuestions, error: checkErr } = await supabase
      .from('questions')
      .select('question_id, mock_test:mock_test_id(title)')
      .eq('bank_question_id', id);

    if (checkErr) {
      res.status(500).json({ success: false, message: 'Error checking question usage: ' + checkErr.message });
      return;
    }

    if (usedQuestions && usedQuestions.length > 0) {
      const testTitles = usedQuestions.map((q: any) => q.mock_test?.title).filter(Boolean).join(', ');
      res.status(400).json({
        success: false,
        message: `Cannot delete: This question has already been used in mock tests (${testTitles}).`,
      });
      return;
    }

    // 2. Perform safe deletion
    const { error: delErr } = await supabase
      .from('question_bank')
      .delete()
      .eq('bank_question_id', id);

    if (delErr) {
      res.status(400).json({ success: false, message: 'Failed to delete question: ' + delErr.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully from Question Bank.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
