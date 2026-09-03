import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getMockTests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('mock_test')
      .select('*, subject:subject_id(name), exam:exam_id(name)')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch mock tests: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, mockTests: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMockTestDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;
    const { data, error } = await supabase
      .from('mock_test')
      .select('*, subject:subject_id(name), exam:exam_id(name)')
      .eq('mock_test_id', testId)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, message: 'Mock test not found.' });
      return;
    }

    res.status(200).json({ success: true, mockTest: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delivers test questions for student attempt WITHOUT answer key (prevents paper leaks!)
 */
export const getQuestionsForAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;

    // Fetch from safe student_questions_view or select specific columns (excluding `answers`)
    const { data, error } = await supabase
      .from('questions')
      .select('question_id, mock_test_id, subject_id, question_text, question_type, marks_per_question, negative_marking, question_image_url, option_array')
      .eq('mock_test_id', testId)
      .order('question_id', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to load test questions: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, questions: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Evaluates student test submission and records telemetry
 */
export const submitTestAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Only Class 12 students are permitted to attempt tests.' });
      return;
    }

    const { testId } = req.params;
    const { answers, time_taken } = req.body; // answers: { [question_id]: selected_option_key }

    // 1. Fetch test details
    const { data: test, error: testErr } = await supabase
      .from('mock_test')
      .select('*')
      .eq('mock_test_id', testId)
      .single();

    if (testErr || !test) {
      res.status(404).json({ success: false, message: 'Mock test not found.' });
      return;
    }

    // 2. Fetch full questions with correct answers
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('*')
      .eq('mock_test_id', testId);

    if (qErr || !questions) {
      res.status(500).json({ success: false, message: 'Failed to retrieve question keys.' });
      return;
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let scoreObtained = 0;
    const perQuestionResponses: any[] = [];

    for (const q of questions) {
      const selected = answers ? answers[q.question_id] : undefined;
      const marks = Number(q.marks_per_question) || 1;
      const neg = Number(q.negative_marking) || 0;

      if (selected === undefined || selected === null || selected === '') {
        unansweredCount++;
        perQuestionResponses.push({
          question_id: q.question_id,
          selected_options: null,
          is_correct: false,
        });
      } else {
        // Compare with correct answer
        const correctAnswer = q.answers?.correct || q.answers?.correct_option || q.answers;
        const isCorrect = String(selected).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

        if (isCorrect) {
          correctCount++;
          scoreObtained += marks;
        } else {
          wrongCount++;
          if (test.negative_marking) {
            scoreObtained -= neg;
          }
        }

        perQuestionResponses.push({
          question_id: q.question_id,
          selected_options: { selected },
          is_correct: isCorrect,
        });
      }
    }

    if (scoreObtained < 0) scoreObtained = 0;
    const maxMarks = Number(test.max_marks) || questions.length;
    const percentage = maxMarks > 0 ? Math.round((scoreObtained / maxMarks) * 100) : 0;

    // 3. Save attempt record
    const { data: attempt, error: attErr } = await supabase
      .from('test_attempts')
      .insert([
        {
          student_id: user.userId,
          mock_test_id: testId,
          submitted_at: new Date().toISOString(),
          time_taken: time_taken || 0,
          total_questions: questions.length,
          attempted_questions: correctCount + wrongCount,
          correct_ans: correctCount,
          wrong_ans: wrongCount,
          unanswered: unansweredCount,
          score_obtained: scoreObtained,
          percentage,
          status: 'COMPLETED',
        },
      ])
      .select()
      .single();

    if (attErr) {
      res.status(500).json({ success: false, message: 'Failed to record test attempt: ' + attErr.message });
      return;
    }

    // 4. Save per-question responses
    if (perQuestionResponses.length > 0) {
      const answersToInsert = perQuestionResponses.map((item) => ({
        attempt_id: attempt.attempt_id,
        question_id: item.question_id,
        selected_options: item.selected_options,
        is_correct: item.is_correct,
      }));
      await supabase.from('test_attempt_answers').insert(answersToInsert);
    }

    // 5. Automatic Jaypee Scholarship Lead Conversion (if score >= 80%)
    if (percentage >= 80) {
      await supabase.from('scholarship_leads').insert([
        {
          student_id: user.userId,
          score_percentile: percentage,
          scholarship_slab: percentage >= 90 ? '75% Tuition Waiver' : '50% Tuition Waiver',
          counselor_call_status: 'NOT_CONTACTED',
        },
      ]);
    }

    res.status(200).json({
      success: true,
      message: 'Test submitted and evaluated successfully!',
      result: {
        attemptId: attempt.attempt_id,
        scoreObtained,
        maxMarks,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        timeTaken: time_taken,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentTestHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId || req.user?.userId;
    if (!studentId) {
      res.status(400).json({ success: false, message: 'Student ID missing.' });
      return;
    }

    const { data, error } = await supabase
      .from('test_attempts')
      .select('*, mock_test:mock_test_id(title, max_marks, passing_marks, subject:subject_id(name))')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to load test history: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, attempts: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAttemptAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const [attemptRes, answersRes] = await Promise.all([
      supabase.from('test_attempts').select('*, mock_test:mock_test_id(*)').eq('attempt_id', attemptId).single(),
      supabase
        .from('test_attempt_answers')
        .select('*, question:question_id(*)')
        .eq('attempt_id', attemptId),
    ]);

    if (attemptRes.error || !attemptRes.data) {
      res.status(404).json({ success: false, message: 'Test attempt not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      attempt: attemptRes.data,
      responses: answersRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
