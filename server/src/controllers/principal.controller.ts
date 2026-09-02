import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Principal manually creates teacher credentials (Email & Password).
 * Teacher will subsequently log in using these credentials from the base website.
 */
export const createTeacherAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(403).json({ success: false, message: 'Principal is not associated with an active school.' });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Teacher email and password are required.' });
      return;
    }

    // 1. Create auth user in Supabase
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'TEACHER', school_id: schoolId } },
    });

    if (authErr) {
      res.status(400).json({ success: false, message: 'Failed to provision teacher auth account: ' + authErr.message });
      return;
    }

    const authId = authData.user?.id;

    // 2. Insert into teachers table with status NOT COMPLETED and full_name null
    const { data: teacher, error: dbErr } = await supabase
      .from('teachers')
      .insert([
        {
          school_id: schoolId,
          email,
          auth_id: authId,
          full_name: null, // to be entered by teacher upon first login
          status: 'NOT_COMPLETED',
        },
      ])
      .select()
      .single();

    if (dbErr) {
      res.status(500).json({ success: false, message: 'Failed to save teacher record: ' + dbErr.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Teacher account created for ${email}. Teacher can now log in using these credentials to complete their profile.`,
      teacher,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSchoolTeachers = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier missing.' });
      return;
    }

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teachers: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, teachers: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * ONLY Principal approves teachers belonging to their school!
 */
export const approveTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    const { teacherId } = req.params;

    let { data, error } = await supabase
      .from('teachers')
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      const retry = await supabase
        .from('teachers')
        .update({
          status: 'VERIFIED',
          updated_at: new Date().toISOString(),
        })
        .eq('teacher_id', teacherId)
        .eq('school_id', schoolId)
        .select()
        .maybeSingle();

      if (retry.error) {
        res.status(400).json({ success: false, message: 'Failed to approve teacher: ' + retry.error.message });
        return;
      }
      data = retry.data;
    }

    res.status(200).json({
      success: true,
      message: `Teacher ${data?.full_name || data?.email} approved successfully.`,
      teacher: data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSchoolStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier missing.' });
      return;
    }

    const { data, error } = await supabase
      .from('student')
      .select('*')
      .eq('school_id', schoolId)
      .eq('class', 12)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch students: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, students: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveStudent = async (req: Request, res: Response): Promise<void> => {
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
        res.status(400).json({ success: false, message: 'Failed to approve student: ' + retry.error.message });
        return;
      }
      data = retry.data;
    }

    res.status(200).json({
      success: true,
      message: `Class 12 student ${data?.full_name} approved successfully.`,
      student: data,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSchoolDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier missing.' });
      return;
    }

    const [teachersRes, pendingTeachersRes, studentsRes, pendingStudentsRes] = await Promise.all([
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'VERIFIED'),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'PENDING'),
      supabase.from('student').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('class', 12).eq('status', 'VERIFIED'),
      supabase.from('student').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('class', 12).eq('status', 'PENDING'),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalTeachers: teachersRes.count || 0,
        pendingTeachers: pendingTeachersRes.count || 0,
        totalClass12Students: studentsRes.count || 0,
        pendingStudents: pendingStudentsRes.count || 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
