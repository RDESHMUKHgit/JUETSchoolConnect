import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getMockTests = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string)?.trim().toLowerCase();
    const subjectsParam = req.query.subjects as string; // e.g. "Physics,Mathematics"
    const sortBy = (req.query.sortBy as string) || 'created_at';
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc';
    const duration = req.query.duration ? parseInt(req.query.duration as string) : undefined;
    const minQuestions = req.query.minQuestions ? parseInt(req.query.minQuestions as string) : undefined;
    const maxQuestions = req.query.maxQuestions ? parseInt(req.query.maxQuestions as string) : undefined;

    let query = supabase
      .from('mock_test')
      .select('*, subject:subject_id(name), exam:exam_id(name), mock_test_subjects(subject:subject_id(name))');

    // Dynamic sorting
    const validSortFields = ['created_at', 'total_questions', 'max_marks', 'max_time_in_mins', 'title'];
    const fieldToSort = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(fieldToSort, { ascending: sortOrder });

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch mock tests: ' + error.message });
      return;
    }

    // Flatten multi-subjects for client convenience
    let formatted = (data || []).map((t: any) => {
      const multiSubjs = t.mock_test_subjects?.map((ms: any) => ms.subject?.name).filter(Boolean) || [];
      const primarySubj = t.subject?.name;
      const allSubjects = multiSubjs.length > 0 ? multiSubjs : (primarySubj ? [primarySubj] : []);
      return {
        ...t,
        subjects: allSubjects,
      };
    });

    // In-memory fuzzy search and multi-criteria filters for precision across joined relations
    if (search) {
      formatted = formatted.filter((t: any) => {
        const titleMatch = t.title?.toLowerCase().includes(search);
        const descMatch = t.description?.toLowerCase().includes(search);
        const subjMatch = t.subjects?.some((s: string) => s.toLowerCase().includes(search));
        return titleMatch || descMatch || subjMatch;
      });
    }

    if (subjectsParam) {
      const selectedSubjects = subjectsParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (selectedSubjects.length > 0 && !selectedSubjects.includes('all')) {
        formatted = formatted.filter((t: any) => {
          return t.subjects?.some((subName: string) =>
            selectedSubjects.includes(subName.toLowerCase())
          );
        });
      }
    }

    if (duration) {
      formatted = formatted.filter((t: any) => Number(t.max_time_in_mins) <= duration);
    }

    if (minQuestions !== undefined && !isNaN(minQuestions)) {
      formatted = formatted.filter((t: any) => Number(t.total_questions) >= minQuestions);
    }

    if (maxQuestions !== undefined && !isNaN(maxQuestions)) {
      formatted = formatted.filter((t: any) => Number(t.total_questions) <= maxQuestions);
    }

    // If user is a student, attach their personal attempt status for each mock test
    const user = req.user;
    if (user && user.role === 'STUDENT') {
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('mock_test_id, status, score_obtained, percentage')
        .eq('student_id', user.userId);

      const attemptsMap = new Map<string, any>();
      (attempts || []).forEach((att: any) => {
        attemptsMap.set(att.mock_test_id, att);
      });

      formatted = formatted.map((t: any) => {
        const att = attemptsMap.get(t.mock_test_id);
        return {
          ...t,
          has_attempted: Boolean(att),
          attempt_status: att?.status || null,
          student_score: att?.score_obtained ?? null,
          student_percentage: att?.percentage ?? null,
        };
      });
    }

    res.status(200).json({ success: true, mockTests: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const validateAccessKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;
    const { accessKey } = req.body;
    const user = req.user;

    if (!accessKey || !accessKey.trim()) {
      res.status(400).json({ success: false, message: 'Please enter the 6-digit access key provided by your teacher.' });
      return;
    }

    // 1. CRITICAL: Enforce single attempt per student per mock test
    if (user && user.role === 'STUDENT') {
      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('attempt_id, status, score_obtained, percentage')
        .eq('student_id', user.userId)
        .eq('mock_test_id', testId)
        .maybeSingle();

      if (existingAttempt) {
        res.status(403).json({
          success: false,
          alreadyAttempted: true,
          message: 'You have already attempted and completed this mock test. Retakes are strictly prohibited.',
        });
        return;
      }
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
    const user = req.user;

    // Single-attempt check
    if (user && user.role === 'STUDENT') {
      const { data: existingAttempt } = await supabase
        .from('test_attempts')
        .select('attempt_id')
        .eq('student_id', user.userId)
        .eq('mock_test_id', testId)
        .maybeSingle();

      if (existingAttempt) {
        res.status(403).json({
          success: false,
          alreadyAttempted: true,
          message: 'You have already completed this test attempt. You cannot access the question paper again.',
        });
        return;
      }
    }

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
 * Evaluates student test submission and records telemetry & per-question dwell times
 */
export const submitTestAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Only Class 12 students are permitted to attempt tests.' });
      return;
    }

    const { testId } = req.params;
    const { answers, time_taken, question_timings } = req.body; // answers: { [question_id]: selected_option_key }

    // 1. Verify student has not already attempted this mock test
    const { data: priorAttempt } = await supabase
      .from('test_attempts')
      .select('attempt_id')
      .eq('student_id', user.userId)
      .eq('mock_test_id', testId)
      .maybeSingle();

    if (priorAttempt) {
      res.status(403).json({
        success: false,
        alreadyAttempted: true,
        message: 'Multiple attempts are strictly forbidden. Your first submission is already recorded.',
      });
      return;
    }

    // 2. Fetch test details
    const { data: test, error: testErr } = await supabase
      .from('mock_test')
      .select('*')
      .eq('mock_test_id', testId)
      .single();

    if (testErr || !test) {
      res.status(404).json({ success: false, message: 'Mock test not found.' });
      return;
    }

    // 3. Fetch full questions with correct answers
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
      const timeSpent = question_timings && question_timings[q.question_id] ? Number(question_timings[q.question_id]) : 0;

      if (selected === undefined || selected === null || selected === '') {
        unansweredCount++;
        perQuestionResponses.push({
          question_id: q.question_id,
          selected_options: null,
          is_correct: false,
          time_spent_seconds: timeSpent,
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
          time_spent_seconds: timeSpent,
        });
      }
    }

    if (scoreObtained < 0) scoreObtained = 0;
    const maxMarks = Number(test.max_marks) || questions.length;
    const percentage = maxMarks > 0 ? Math.round((scoreObtained / maxMarks) * 100) : 0;

    // 4. Save attempt record with graceful column fallback and race-condition safety
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
      if (attErr1.code === '23505' || attErr1.message.includes('unique') || attErr1.message.includes('duplicate')) {
        res.status(409).json({ success: false, message: 'You have already submitted an attempt for this test.' });
        return;
      }

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

    // 5. Save per-question responses and dwell times in test_attempt_answers
    if (perQuestionResponses.length > 0) {
      const answersToInsert = perQuestionResponses.map((item) => ({
        attempt_id: attempt.attempt_id,
        question_id: item.question_id,
        selected_options: item.selected_options,
        is_correct: item.is_correct,
        time_spent_seconds: item.time_spent_seconds || 0,
      }));
      await supabase.from('test_attempt_answers').insert(answersToInsert);
    }

    // 6. Automatic Jaypee Scholarship Lead Conversion (if score >= 80%)
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
      message: 'Test submitted successfully! Complete result and diagnostic analytics can only be viewed in the School Connect Mobile App.',
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

    const limitParam = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    let query = supabase
      .from('test_attempts')
      .select('*, mock_test:mock_test_id(title, max_marks, passing_marks, subject:subject_id(name))')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (limitParam && !isNaN(limitParam) && limitParam > 0) {
      query = query.limit(limitParam);
    }

    const { data, error } = await query;

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

/**
 * Leaderboard for a specific mock test, strictly scoped to the requester's school
 */
export const getMockTestLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'User is not associated with an accredited school.' });
      return;
    }

    // 1. Try DB function first
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_mock_test_leaderboard', {
      p_mock_test_id: testId,
      p_school_id: schoolId,
    });

    if (!rpcErr && rpcData) {
      res.status(200).json({ success: true, leaderboard: rpcData });
      return;
    }

    // 2. Direct fallback query if RPC function hasn't been executed
    const { data, error } = await supabase
      .from('test_attempts')
      .select('attempt_id, score_obtained, percentage, time_taken, submitted_at, student:student_id!inner(student_id, full_name, profile_photo_url, school_id)')
      .eq('mock_test_id', testId)
      .eq('student.school_id', schoolId)
      .eq('status', 'COMPLETED')
      .order('score_obtained', { ascending: false })
      .order('time_taken', { ascending: true })
      .order('submitted_at', { ascending: true })
      .limit(100);

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to load test leaderboard: ' + error.message });
      return;
    }

    const ranked = (data || []).map((row: any, idx: number) => ({
      rank: idx + 1,
      student_id: row.student?.student_id,
      full_name: row.student?.full_name,
      profile_photo_url: row.student?.profile_photo_url,
      school_id: row.student?.school_id,
      score_obtained: row.score_obtained || 0,
      percentage: row.percentage || 0,
      time_taken: row.time_taken || 0,
      submitted_at: row.submitted_at,
    }));

    res.status(200).json({ success: true, leaderboard: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Overall school leaderboard aggregated across all mock tests, strictly scoped to requester's school
 */
export const getSchoolOverallLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'User is not associated with an accredited school.' });
      return;
    }

    // 1. Try DB function first
    const { data: rpcData, error: rpcErr } = await supabase.rpc('get_school_overall_leaderboard', {
      p_school_id: schoolId,
    });

    if (!rpcErr && rpcData) {
      res.status(200).json({ success: true, leaderboard: rpcData });
      return;
    }

    // 2. Direct fallback query
    const { data: attempts, error } = await supabase
      .from('test_attempts')
      .select('attempt_id, score_obtained, percentage, submitted_at, student:student_id!inner(student_id, full_name, profile_photo_url, school_id)')
      .eq('student.school_id', schoolId)
      .eq('status', 'COMPLETED');

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to load school leaderboard: ' + error.message });
      return;
    }

    const studentMap = new Map<string, any>();
    (attempts || []).forEach((att: any) => {
      const sId = att.student?.student_id;
      if (!sId) return;
      const existing = studentMap.get(sId) || {
        student_id: sId,
        full_name: att.student?.full_name,
        profile_photo_url: att.student?.profile_photo_url,
        tests_completed: 0,
        total_score: 0,
        percentage_sum: 0,
        last_attempt_at: att.submitted_at,
      };
      existing.tests_completed += 1;
      existing.total_score += Number(att.score_obtained || 0);
      existing.percentage_sum += Number(att.percentage || 0);
      if (new Date(att.submitted_at) > new Date(existing.last_attempt_at)) {
        existing.last_attempt_at = att.submitted_at;
      }
      studentMap.set(sId, existing);
    });

    const aggregated = Array.from(studentMap.values()).map((s: any) => ({
      ...s,
      avg_percentage: s.tests_completed > 0 ? Math.round(s.percentage_sum / s.tests_completed) : 0,
    }));

    aggregated.sort((a, b) => b.total_score - a.total_score || b.avg_percentage - a.avg_percentage);

    const ranked = aggregated.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

    res.status(200).json({ success: true, leaderboard: ranked });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
