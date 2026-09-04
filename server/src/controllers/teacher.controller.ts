import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { signToken, setAuthCookie } from '../utils/token.utils.js';
import { JwtUserPayload } from '../types/auth.types.js';
import { generateStudentTempPassword } from '../utils/student.utils.js';

export const completeTeacherProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'TEACHER') {
      res.status(403).json({ success: false, message: 'Teacher role required.' });
      return;
    }

    const {
      full_name,
      phone,
      teachers_emp_id,
      designation,
      department,
      qualification,
      specialization,
      gender,
      dob,
      profile_photo_url,
    } = req.body;

    const updateFields: Record<string, any> = {
      phone,
      teachers_emp_id,
      designation: designation || 'Teacher',
      department,
      qualification,
      specialization,
      gender,
      dob,
      status: 'PENDING',
      updated_at: new Date().toISOString(),
    };
    if (full_name) {
      updateFields.full_name = full_name;
    }
    if (profile_photo_url) {
      updateFields.profile_photo_url = profile_photo_url;
    }

    const { data: updated, error } = await supabase
      .from('teachers')
      .update(updateFields)
      .eq('teacher_id', user.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to update teacher profile: ' + error.message });
      return;
    }

    const payload: JwtUserPayload = {
      userId: user.userId,
      authId: user.authId,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      fullName: updated.full_name,
      status: 'PENDING',
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Profile completed! Your account is now pending approval by your School Principal.',
      user: payload,
      nextStep: '/teacher/verification',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Teacher uploads CSV data (name and email).
 * Provisions Supabase Auth user & public.student records with status NOT_COMPLETED.
 * Generates temporary password following formula ${studentFirstName}@${schoolCode}.
 */
export const bulkRegisterStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'TEACHER') {
      res.status(403).json({ success: false, message: 'Teacher credentials required.' });
      return;
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'Teacher is not associated with an accredited school.' });
      return;
    }

    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ success: false, message: 'No student records provided.' });
      return;
    }

    // Retrieve school name to compute school code
    let schoolName = user.schoolName || 'School';
    if (!user.schoolName) {
      const { data: sch } = await supabase.from('school').select('name').eq('school_id', schoolId).maybeSingle();
      if (sch) schoolName = sch.name;
    }

    console.log(`\n====================================================`);
    console.log(`📋 TEACHER BULK STUDENT ONBOARDING (${students.length} candidates)`);
    console.log(`Institution: ${schoolName} | Teacher: ${user.fullName || user.email}`);
    console.log(`====================================================`);

    const manifest: Array<{
      name: string;
      email: string;
      tempPassword: string;
      status: 'PROVISIONED' | 'ALREADY_EXISTS' | 'FAILED';
      error?: string;
    }> = [];

    for (const item of students) {
      const name = item.name ? String(item.name).trim() : '';
      const email = item.email ? String(item.email).trim().toLowerCase() : '';

      if (!name || !email) {
        manifest.push({
          name: name || 'Unknown',
          email: email || 'Unknown',
          tempPassword: '',
          status: 'FAILED',
          error: 'Name and email are both required.',
        });
        continue;
      }

      // 1. Generate temp password following formula ${studentFirstName}@${schoolCode}
      const tempPassword = generateStudentTempPassword(name, schoolName);

      try {
        // 2. Check if student already exists in public.student
        const { data: existingStudent } = await supabase
          .from('student')
          .select('student_id, email, status')
          .eq('email', email)
          .maybeSingle();

        if (existingStudent) {
          manifest.push({
            name,
            email,
            tempPassword: '(Account already registered)',
            status: 'ALREADY_EXISTS',
          });
          continue;
        }

        // 3. Create Supabase Auth user
        let authId: string | null = null;
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            data: {
              full_name: name,
              role: 'STUDENT',
              school_id: schoolId,
              teacher_id: user.userId,
            },
          },
        });

        if (authErr && !authData?.user) {
          if (authErr.message.includes('already registered')) {
            // User exists in auth but not in student table; sign in or link
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email,
              password: tempPassword,
            });
            authId = signInData?.user?.id || null;
          } else {
            manifest.push({
              name,
              email,
              tempPassword,
              status: 'FAILED',
              error: authErr.message,
            });
            continue;
          }
        } else {
          authId = authData?.user?.id || null;
        }

        // 4. Insert into public.student
        const { error: insertErr } = await supabase.from('student').insert([
          {
            full_name: name,
            email,
            auth_id: authId,
            school_id: schoolId,
            teacher_id: user.userId,
            class: 12,
            status: 'NOT_COMPLETED',
          },
        ]);

        if (insertErr) {
          manifest.push({
            name,
            email,
            tempPassword,
            status: 'FAILED',
            error: insertErr.message,
          });
        } else {
          console.log(`   ✨ Provisioned: ${name} <${email}> | Initial Password: ${tempPassword}`);
          manifest.push({
            name,
            email,
            tempPassword,
            status: 'PROVISIONED',
          });
        }
      } catch (err: any) {
        manifest.push({
          name,
          email,
          tempPassword,
          status: 'FAILED',
          error: err.message,
        });
      }
    }

    console.log(`====================================================\n`);

    const provisionedCount = manifest.filter((m) => m.status === 'PROVISIONED').length;

    res.status(200).json({
      success: true,
      message: `Successfully processed ${students.length} candidates. ${provisionedCount} student accounts provisioned with status NOT_COMPLETED.`,
      provisionedCount,
      manifest,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Returns students who completed their profile and are awaiting verification (status: PENDING)
 */
export const getPendingStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'Teacher is not associated with a school.' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from('student')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('status', 'PENDING')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to load verification queue: ' + error.message });
      return;
    }

    res.status(200).json({
      success: true,
      pendingStudents: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Teacher verifies student profile -> status becomes ACTIVE
 */
export const verifyStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    const { studentId } = req.params;

    let { data, error } = await supabase
      .from('student')
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      const retry = await supabase
        .from('student')
        .update({
          status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('student_id', studentId)
        .eq('school_id', schoolId)
        .select()
        .maybeSingle();

      if (retry.error) {
        res.status(400).json({ success: false, message: 'Failed to verify student: ' + retry.error.message });
        return;
      }
      data = retry.data;
    }

    res.status(200).json({
      success: true,
      message: `Student "${data?.full_name || 'Candidate'}" verified and activated successfully.`,
      student: data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Teacher rejects student profile -> status becomes SUSPENDED
 */
export const rejectStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    const { studentId } = req.params;

    const { data, error } = await supabase
      .from('student')
      .update({
        status: 'SUSPENDED',
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to reject student: ' + error.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Student enrollment rejected.`,
      student: data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssignedStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'Teacher is not associated with a school.' });
      return;
    }

    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('school_id', schoolId)
      .eq('class', 12)
      .order('full_name', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch students: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, students: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStudentPerformanceDiagnostic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const [studentRes, attemptsRes] = await Promise.all([
      supabase.from('student').select('*, school:school_id(name)').eq('student_id', studentId).single(),
      supabase
        .from('test_attempts')
        .select('*, mock_test:mock_test_id(title, max_marks, passing_marks)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
    ]);

    if (studentRes.error || !studentRes.data) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      student: studentRes.data,
      attempts: attemptsRes.data || [],
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
