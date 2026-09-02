import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { signToken, setAuthCookie } from '../utils/token.utils.js';
import { JwtUserPayload } from '../types/auth.types.js';

export const completeTeacherProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'TEACHER') {
      res.status(403).json({ success: false, message: 'Teacher role required.' });
      return;
    }

    const {
      full_name, // entered here because principal only entered email & password!
      phone,
      teachers_emp_id,
      designation,
      department,
      qualification,
      specialization,
      gender,
      dob,
    } = req.body;

    if (!full_name) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    const { data: updated, error } = await supabase
      .from('teachers')
      .update({
        full_name,
        phone,
        teachers_emp_id,
        designation: designation || 'Teacher',
        department,
        qualification,
        specialization,
        gender,
        dob,
        status: 'PENDING', // Moves directly from NOT COMPLETED to PENDING (no school form needed)
        updated_at: new Date().toISOString(),
      })
      .eq('teacher_id', user.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to update teacher profile: ' + error.message });
      return;
    }

    const payload: JwtUserPayload = {
      ...user,
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
      .eq('status', 'VERIFIED')
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
