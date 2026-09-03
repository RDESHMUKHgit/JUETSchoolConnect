import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getMockTests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('mock_test')
      .select('*, subject:subject_id(name), exam:exam_id(name), mock_test_subjects(subject:subject_id(name))')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch mock tests: ' + error.message });
      return;
    }

    // Flatten multi-subjects for client convenience
    const formatted = (data || []).map((t: any) => {
      const multiSubjs = t.mock_test_subjects?.map((ms: any) => ms.subject?.name).filter(Boolean) || [];
      const primarySubj = t.subject?.name;
      const allSubjects = multiSubjs.length > 0 ? multiSubjs : (primarySubj ? [primarySubj] : []);
      return {
        ...t,
        subjects: allSubjects,
      };
    });

    res.status(200).json({ success: true, mockTests: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const validateAccessKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;
    const { accessKey } = req.body;

    if (!accessKey || !accessKey.trim()) {
      res.status(400).json({ success: false, message: 'Please enter the 6-digit access key provided by your teacher.' });
      return;
    }

    const { data: test, error } = await supabase
      .from('mock_test')
      .select('mock_test_id, title, max_time_in_mins, access_key, access_key_expires_at')
      .eq('mock_test_id', testId)
      .single();

    if (error || !test) {
      res.status(404).json({ success: false, message: 'Mock test not found.' });
      return;
    }

    if (!test.access_key) {
      res.status(400).json({
        success: false,
        message: 'The examination key has not been generated yet. Please ask your teacher to activate the test session.',
      });
      return;
    }

    // Check if key matches (strictly 6-digit numeric match)
    if (test.access_key.trim() !== accessKey.trim()) {
      res.status(400).json({
        success: false,
        message: 'Invalid access key. Please double-check the 6-digit key with your teacher.',
      });
      return;
    }

    // Check if key is expired
    if (!test.access_key_expires_at || new Date(test.access_key_expires_at) <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'This access key has expired (validity is 60 minutes). Please request your teacher to generate a new key.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Access key verified successfully.',
      test: {
        testId: test.mock_test_id,
        title: test.title,
        durationMins: test.max_time_in_mins || 60,
      },
    });
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

    // 3. Save attempt record with graceful column fallback
    const baseAttemptRecord: any = {
      student_id: user.userId,
      mock_test_id: testId,
      submitted_at: new Date().toISOString(),
      time_taken: time_taken || 0,
      total_questions: questions.length,
      attempted_questions: correctCount + wrongCount,
      correct_ans: correctCount,
      wrong_ans: wrongCount,
      unanswered: unansweredCount,
    };

    let attempt: any = null;
    const { data: attWithMetrics, error: attErr1 } = await supabase
      .from('test_attempts')
      .insert([{ ...baseAttemptRecord, score_obtained: scoreObtained, percentage, status: 'COMPLETED' }])
      .select()
      .maybeSingle();

    if (attErr1) {
      const { data: attBase, error: attErr2 } = await supabase
        .from('test_attempts')
        .insert([baseAttemptRecord])
        .select()
        .maybeSingle();

      if (attErr2 || !attBase) {
        res.status(500).json({ success: false, message: 'Failed to record test attempt: ' + (attErr2?.message || attErr1.message) });
        return;
      }
      attempt = attBase;
    } else {
      attempt = attWithMetrics;
    }

    // 4. Save per-question responses in test_attempt_answers
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
      message: 'Test submitted successfully! Complete result and diagnostic analytics can only be viewed in the Jaypee Mobile App.',
      result: {
        attemptId: attempt.attempt_id,
        scoreObtained,
        maxMarks,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        timeTaken: time_taken,
        mobileAppRequired: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Delivers full test paper WITH answer keys for TEACHERS, ADMIN, and EXAM_ADMIN
 */
export const getFullTestPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;

    const [testRes, qRes] = await Promise.all([
      supabase.from('mock_test').select('*, subject:subject_id(name), exam:exam_id(name)').eq('mock_test_id', testId).single(),
      supabase.from('questions').select('*').eq('mock_test_id', testId).order('question_id', { ascending: true }),
    ]);

    if (testRes.error || !testRes.data) {
      res.status(404).json({ success: false, message: 'Mock test paper not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      mockTest: testRes.data,
      questions: qRes.data || [],
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
