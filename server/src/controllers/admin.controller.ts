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
    const { status, search } = req.query;

    let schoolQuery = supabase.from('school').select('*').order('created_at', { ascending: false });
    if (status && status !== 'ALL') {
      schoolQuery = schoolQuery.eq('status', status);
    }

    const { data: schoolsData, error: sErr } = await schoolQuery;
    if (sErr) throw sErr;

    // Fetch principals, teachers, students to compute counts accurately and reliably
    const [pRes, tRes, stRes] = await Promise.all([
      supabase.from('principal').select('principal_id, school_id, full_name, email, phone, designation, status, created_at'),
      supabase.from('teachers').select('teacher_id, school_id, full_name, email, status'),
      supabase.from('student').select('student_id, school_id, teacher_id, full_name, status'),
    ]);

    const principalsBySchool = new Map<string, any>();
    (pRes.data || []).forEach((p: any) => {
      if (p.school_id) principalsBySchool.set(p.school_id, p);
    });

    const teachersCountBySchool = new Map<string, number>();
    (tRes.data || []).forEach((t: any) => {
      if (t.school_id) {
        teachersCountBySchool.set(t.school_id, (teachersCountBySchool.get(t.school_id) || 0) + 1);
      }
    });

    const studentsCountBySchool = new Map<string, number>();
    (stRes.data || []).forEach((st: any) => {
      if (st.school_id) {
        studentsCountBySchool.set(st.school_id, (studentsCountBySchool.get(st.school_id) || 0) + 1);
      }
    });

    let schools = (schoolsData || []).map((s: any) => {
      const p = principalsBySchool.get(s.school_id);
      return {
        ...s,
        principal: p || null,
        teacher_count: teachersCountBySchool.get(s.school_id) || 0,
        student_count: studentsCountBySchool.get(s.school_id) || 0,
        status: s.status || (p?.status === 'ACTIVE' || p?.status === 'VERIFIED' ? 'VERIFIED' : p?.status || 'PENDING'),
      };
    });

    if (search) {
      const q = (search as string).toLowerCase().trim();
      schools = schools.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(q) ||
          s.city?.toLowerCase().includes(q) ||
          s.state?.toLowerCase().includes(q) ||
          s.registration_no?.toLowerCase().includes(q) ||
          s.principal?.full_name?.toLowerCase().includes(q) ||
          s.principal?.email?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, schools });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get detailed institutional hierarchy for a specific school
 * Returns: School info, Principal info, All Teachers (with student counts and student list), All Students in School
 */
export const getSchoolHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolId } = req.params;

    const [sRes, pRes, tRes, stRes] = await Promise.all([
      supabase.from('school').select('*').eq('school_id', schoolId).single(),
      supabase.from('principal').select('*').eq('school_id', schoolId).maybeSingle(),
      supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
      supabase
        .from('student')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false }),
    ]);

    if (sRes.error) {
      res.status(404).json({ success: false, message: 'School not found: ' + sRes.error.message });
      return;
    }

    const teachers = tRes.data || [];
    const allStudents = stRes.data || [];

    // Map teacher id to their students
    const studentsByTeacher = new Map<string, any[]>();
    allStudents.forEach((st: any) => {
      if (st.teacher_id) {
        const list = studentsByTeacher.get(st.teacher_id) || [];
        list.push(st);
        studentsByTeacher.set(st.teacher_id, list);
      }
    });

    // Attach student list and count to each teacher
    const teachersWithStudents = teachers.map((t: any) => {
      const teacherStudents = studentsByTeacher.get(t.teacher_id) || [];
      return {
        ...t,
        student_count: teacherStudents.length,
        students: teacherStudents,
      };
    });

    // Create a map of teacher names to label students in the school-wide list
    const teacherNameMap = new Map<string, string>();
    teachers.forEach((t: any) => {
      teacherNameMap.set(t.teacher_id, t.full_name);
    });

    const studentsWithTeacherName = allStudents.map((st: any) => ({
      ...st,
      teacher_name: st.teacher_id ? teacherNameMap.get(st.teacher_id) || 'Assigned Faculty' : 'Unassigned',
    }));

    res.status(200).json({
      success: true,
      school: sRes.data,
      principal: pRes.data || null,
      teachers: teachersWithStudents,
      all_students: studentsWithTeacherName,
      summary: {
        totalTeachers: teachers.length,
        activeTeachers: teachers.filter((t: any) => t.status === 'ACTIVE' || t.status === 'VERIFIED').length,
        pendingTeachers: teachers.filter((t: any) => t.status === 'PENDING' || t.status === 'INVITED').length,
        totalStudents: allStudents.length,
        activeStudents: allStudents.filter((st: any) => st.status === 'ACTIVE' || st.status === 'VERIFIED').length,
        pendingStudents: allStudents.filter((st: any) => st.status === 'PENDING').length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get all students assigned to a specific teacher
 */
export const getTeacherStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId } = req.params;

    const [tRes, stRes] = await Promise.all([
      supabase.from('teachers').select('*, school:school_id(*)').eq('teacher_id', teacherId).single(),
      supabase.from('student').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
    ]);

    if (tRes.error) {
      res.status(404).json({ success: false, message: 'Teacher not found: ' + tRes.error.message });
      return;
    }

    res.status(200).json({
      success: true,
      teacher: tRes.data,
      students: stRes.data || [],
      totalStudents: (stRes.data || []).length,
    });
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

/**
 * Detailed Platform Matrix: Macro & Micro Status Analytics with full records
 */
export const getDetailedPlatformMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [schoolsRes, principalsRes, teachersRes, studentsRes, testsRes] = await Promise.all([
      supabase.from('school').select('*').order('name'),
      supabase.from('principal').select('*, school:school_id(name, city, state)').order('created_at', { ascending: false }),
      supabase.from('teachers').select('*, school:school_id(name, city, state)').order('created_at', { ascending: false }),
      supabase.from('student').select('*, school:school_id(name), teachers:teacher_id(full_name)').order('created_at', { ascending: false }),
      supabase.from('mock_test').select('*, subject:subject_id(name)'),
    ]);

    const schools = schoolsRes.data || [];
    const principals = principalsRes.data || [];
    const teachers = teachersRes.data || [];
    const students = studentsRes.data || [];
    const tests = testsRes.data || [];

    // 1. Principals Status Grouping
    const principalStatusMap: Record<string, any[]> = {
      ACTIVE: [],
      PENDING: [],
      NOT_COMPLETED: [],
      COMPLETED: [],
      SUSPENDED: [],
    };
    principals.forEach((p: any) => {
      const st = p.status || 'PENDING';
      if (!principalStatusMap[st]) principalStatusMap[st] = [];
      principalStatusMap[st].push({
        ...p,
        school_name: p.school?.name || 'Unlinked Institution',
      });
    });

    const principalsAnalytics = Object.entries(principalStatusMap).map(([status, list]) => ({
      status,
      count: list.length,
      records: list,
    }));

    // 2. Schools Status Grouping
    const schoolStatusMap: Record<string, any[]> = {
      VERIFIED: [],
      PENDING: [],
      REJECTED: [],
    };
    schools.forEach((s: any) => {
      const st = s.status || 'PENDING';
      if (!schoolStatusMap[st]) schoolStatusMap[st] = [];
      schoolStatusMap[st].push(s);
    });

    const schoolsAnalytics = Object.entries(schoolStatusMap).map(([status, list]) => ({
      status,
      count: list.length,
      records: list,
    }));

    // 3. Teachers Status Grouping
    const teacherStatusMap: Record<string, any[]> = {
      ACTIVE: [],
      PENDING: [],
      INVITED: [],
      SUSPENDED: [],
    };
    teachers.forEach((t: any) => {
      const st = t.status || 'PENDING';
      if (!teacherStatusMap[st]) teacherStatusMap[st] = [];
      teacherStatusMap[st].push({
        ...t,
        school_name: t.school?.name || 'Unlinked School',
      });
    });

    const teachersAnalytics = Object.entries(teacherStatusMap).map(([status, list]) => ({
      status,
      count: list.length,
      records: list,
    }));

    // 4. Students Status Grouping
    const studentStatusMap: Record<string, any[]> = {
      VERIFIED: [],
      ACTIVE: [],
      PENDING: [],
      SUSPENDED: [],
    };
    students.forEach((st: any) => {
      const sVal = st.status || 'PENDING';
      if (!studentStatusMap[sVal]) studentStatusMap[sVal] = [];
      studentStatusMap[sVal].push({
        ...st,
        school_name: st.school?.name || 'Unlinked School',
        teacher_name: st.teachers?.full_name || 'Unassigned',
      });
    });

    const studentsAnalytics = Object.entries(studentStatusMap).map(([status, list]) => ({
      status,
      count: list.length,
      records: list,
    }));

    // 5. Build Institution-Scoped Breakdowns for micro analytics
    const schoolsMicroAnalytics = schools.map((s: any) => {
      const schoolTeachers = teachers.filter((t: any) => t.school_id === s.school_id);
      const schoolStudents = students.filter((st: any) => st.school_id === s.school_id);

      const sTeacherStatus: Record<string, any[]> = { ACTIVE: [], PENDING: [], INVITED: [], SUSPENDED: [] };
      schoolTeachers.forEach((t: any) => {
        const st = t.status || 'PENDING';
        if (!sTeacherStatus[st]) sTeacherStatus[st] = [];
        sTeacherStatus[st].push(t);
      });

      const sStudentStatus: Record<string, any[]> = { VERIFIED: [], ACTIVE: [], PENDING: [], SUSPENDED: [] };
      schoolStudents.forEach((st: any) => {
        const sVal = st.status || 'PENDING';
        if (!sStudentStatus[sVal]) sStudentStatus[sVal] = [];
        sStudentStatus[sVal].push(st);
      });

      return {
        school_id: s.school_id,
        name: s.name,
        city: s.city,
        state: s.state,
        status: s.status || 'PENDING',
        total_teachers: schoolTeachers.length,
        total_students: schoolStudents.length,
        teachers_by_status: Object.entries(sTeacherStatus).map(([status, list]) => ({
          status,
          count: list.length,
          records: list,
        })),
        students_by_status: Object.entries(sStudentStatus).map(([status, list]) => ({
          status,
          count: list.length,
          records: list,
        })),
        teachers: schoolTeachers.map((t: any) => {
          const tStudents = schoolStudents.filter((st: any) => st.teacher_id === t.teacher_id);
          const tStudentStatus: Record<string, any[]> = { VERIFIED: [], ACTIVE: [], PENDING: [], SUSPENDED: [] };
          tStudents.forEach((st: any) => {
            const sVal = st.status || 'PENDING';
            if (!tStudentStatus[sVal]) tStudentStatus[sVal] = [];
            tStudentStatus[sVal].push(st);
          });

          return {
            teacher_id: t.teacher_id,
            full_name: t.full_name,
            department: t.department,
            status: t.status,
            total_students: tStudents.length,
            students_by_status: Object.entries(tStudentStatus).map(([status, list]) => ({
              status,
              count: list.length,
              records: list,
            })),
            students: tStudents,
          };
        }),
      };
    });

    res.status(200).json({
      success: true,
      totals: {
        schools: schools.length,
        principals: principals.length,
        teachers: teachers.length,
        students: students.length,
        mockTests: tests.length,
      },
      principalsAnalytics,
      schoolsAnalytics,
      teachersAnalytics,
      studentsAnalytics,
      schoolsMicroAnalytics,
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
          description: `Standardized ${count}-question high-yield mock test generated by School Connect Examination Authority.`,
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
