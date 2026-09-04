import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getPendingSchools = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('principal')
      .select('principal_id, full_name, email, phone, designation, status, created_at, school:school_id (*)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch pending schools: ' + error.message });
      return;
    }

    const schools = (data || []).map((p: any) => ({
      ...p.school,
      principal: {
        principal_id: p.principal_id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        designation: p.designation,
      },
      status: p.status,
    }));

    res.status(200).json({ success: true, schools });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolId } = req.params;

    // 1. Update school record status to VERIFIED
    await supabase
      .from('school')
      .update({
        status: 'VERIFIED',
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId);

    // 2. Update principal status to ACTIVE (with fallback to VERIFIED if supported)
    let { data, error } = await supabase
      .from('principal')
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId)
      .select('*, school:school_id (*)')
      .maybeSingle();

    if (error) {
      const retry = await supabase
        .from('principal')
        .update({
          status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('school_id', schoolId)
        .select('*, school:school_id (*)')
        .maybeSingle();

      if (retry.error) {
        res.status(400).json({ success: false, message: 'Failed to approve school: ' + retry.error.message });
        return;
      }
      data = retry.data;
    }

    res.status(200).json({
      success: true,
      message: `School "${data?.school?.name || 'Institution'}" and associated Principal approved successfully.`,
      school: data?.school,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolId } = req.params;

    // 1. Update school status to REJECTED
    await supabase
      .from('school')
      .update({
        status: 'REJECTED',
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId);

    // 2. Update principal status to SUSPENDED
    const { data, error } = await supabase
      .from('principal')
      .update({
        status: 'SUSPENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId)
      .select('*, school:school_id (*)')
      .maybeSingle();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to reject school: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, message: 'School registration rejected.', school: data?.school });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllSchools = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    let query = supabase.from('principal').select('principal_id, full_name, email, phone, status, created_at, school:school_id (*)').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch schools: ' + error.message });
      return;
    }

    const schools = (data || []).map((p: any) => ({
      ...p.school,
      principal: {
        principal_id: p.principal_id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
      },
      status: p.status,
    }));

    res.status(200).json({ success: true, schools });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPlatformMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [schoolsRes, verifiedSchoolsRes, pendingSchoolsRes, teachersRes, studentsRes, testsRes, attemptsRes] = await Promise.all([
      supabase.from('school').select('*', { count: 'exact', head: true }),
      supabase.from('school').select('*', { count: 'exact', head: true }).in('status', ['VERIFIED', 'ACTIVE']),
      supabase.from('school').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).in('status', ['VERIFIED', 'ACTIVE']),
      supabase.from('student').select('*', { count: 'exact', head: true }).in('status', ['VERIFIED', 'ACTIVE']),
      supabase.from('mock_test').select('*', { count: 'exact', head: true }),
      supabase.from('test_attempts').select('*', { count: 'exact', head: true }),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        totalSchools: schoolsRes.count || 0,
        verifiedSchools: verifiedSchoolsRes.count || 0,
        pendingSchools: pendingSchoolsRes.count || 0,
        activeTeachers: teachersRes.count || 0,
        class12Students: studentsRes.count || 0,
        totalMockTests: testsRes.count || 0,
        totalAttempts: attemptsRes.count || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMockTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      subject_id,
      exam_id,
      total_questions,
      max_marks,
      max_time_in_mins,
      scheduled_time,
      negative_marking,
      passing_marks,
      instructions,
    } = req.body;

    if (!title || !total_questions || !max_marks || !max_time_in_mins) {
      res.status(400).json({ success: false, message: 'Title, total questions, max marks, and duration are required.' });
      return;
    }

    const { data, error } = await supabase
      .from('mock_test')
      .insert([
        {
          title,
          description,
          subject_id,
          exam_id,
          total_questions: Number(total_questions),
          max_marks: Number(max_marks),
          max_time_in_mins: Number(max_time_in_mins),
          scheduled_time,
          negative_marking: Boolean(negative_marking),
          passing_marks: passing_marks ? Number(passing_marks) : null,
          instructions,
        },
      ])
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to create mock test: ' + error.message });
      return;
    }

    res.status(201).json({ success: true, message: 'Mock test created successfully.', mockTest: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      mock_test_id,
      subject_id,
      question_text,
      question_type,
      marks_per_question,
      negative_marking,
      option_array,
      answers,
    } = req.body;

    if (!mock_test_id || !question_text || !option_array || !answers) {
      res.status(400).json({ success: false, message: 'Mock test ID, question text, options, and answer are required.' });
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          mock_test_id,
          subject_id,
          question_text,
          question_type: question_type || 'MCQ',
          marks_per_question: marks_per_question ? Number(marks_per_question) : 1,
          negative_marking: negative_marking ? Number(negative_marking) : 0,
          option_array,
          answers,
        },
      ])
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to add question: ' + error.message });
      return;
    }

    res.status(201).json({ success: true, message: 'Question added successfully.', question: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Automated Mock Test Generator Endpoint
 * Generates a 5-question test paper from jee_paper.json with calibrated options and keys.
 */
export const generateMockTestPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, subject, duration_mins, max_marks, question_count = 5 } = req.body;
    const fs = await import('fs');
    const path = await import('path');

    // Find jee_paper.json
    const possiblePaths = [
      path.resolve(process.cwd(), '../client/jee_paper.json'),
      path.resolve(process.cwd(), 'client/jee_paper.json'),
    ];
    let paperPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        paperPath = p;
        break;
      }
    }

    if (!paperPath) {
      res.status(500).json({ success: false, message: 'Question bank (jee_paper.json) not found.' });
      return;
    }

    const allQuestions: any[] = JSON.parse(fs.readFileSync(paperPath, 'utf-8'));
    const chosenSubject = subject || 'Mathematics';
    let filtered = allQuestions.filter(
      (q) => q.subject && q.subject.toLowerCase() === chosenSubject.toLowerCase() && q.question_type === 'MCQ'
    );
    if (filtered.length === 0) {
      filtered = allQuestions.filter((q) => q.question_type === 'MCQ');
    }

    // Shuffle and pick requested question_count (default 5)
    const count = Math.min(Number(question_count) || 5, filtered.length);
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, count);

    // Ensure subject exists in DB
    let subjectId: string | null = null;
    const { data: subData } = await supabase.from('subject').select('subject_id').ilike('name', chosenSubject).maybeSingle();
    if (subData) {
      subjectId = subData.subject_id;
    }

    // 1. Create mock test
    const testTitle = title || `JEE Main 2026 — ${chosenSubject} Generated Mock ${Date.now().toString().slice(-4)}`;
    const { data: mockTest, error: testErr } = await supabase
      .from('mock_test')
      .insert([
        {
          title: testTitle,
          subject_id: subjectId,
          description: `Standardized ${count}-question high-yield mock test generated by Jaypee Examination Authority.`,
          total_questions: count,
          max_marks: Number(max_marks) || count * 4,
          max_time_in_mins: Number(duration_mins) || 15,
          negative_marking: true,
          passing_marks: Math.round((Number(max_marks) || count * 4) * 0.4),
          instructions: '+4 for correct, -1 for incorrect. NTA examination blueprints.',
        },
      ])
      .select()
      .single();

    if (testErr || !mockTest) {
      res.status(400).json({ success: false, message: 'Failed to create mock test: ' + testErr?.message });
      return;
    }

    // 2. Insert questions
    const OPTION_KEYS = ['A', 'B', 'C', 'D'];
    const questionsToInsert = selected.map((q) => {
      let correctKey = 'A';
      if (q.answers && Array.isArray(q.answers)) {
        const num = parseInt(q.answers[0], 10);
        if (!isNaN(num) && num >= 1 && num <= 4) correctKey = OPTION_KEYS[num - 1];
        else correctKey = String(q.answers[0]).toUpperCase();
      }

      const options = (q.option_array || []).map((opt: any, idx: number) => ({
        key: OPTION_KEYS[idx] || String(idx + 1),
        text: String(opt),
      }));

      return {
        mock_test_id: mockTest.mock_test_id,
        subject_id: subjectId,
        question_text: q.question_text,
        question_type: 'MCQ',
        marks_per_question: q.marks_per_question || 4,
        negative_marking: q.negative_marking !== undefined ? q.negative_marking : 1,
        option_array: options,
        answers: { correct: correctKey, key: correctKey },
        question_image_url: q.question_image_url || null,
      };
    });

    const { error: qErr } = await supabase.from('questions').insert(questionsToInsert);
    if (qErr) {
      res.status(500).json({ success: false, message: 'Mock test created but failed to attach questions: ' + qErr.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Mock test "${mockTest.title}" generated successfully with ${count} questions!`,
      mockTest,
      questionsCount: count,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
