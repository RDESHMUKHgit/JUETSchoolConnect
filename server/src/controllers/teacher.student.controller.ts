import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { generateStudentTempPassword } from '../utils/student.utils.js';

/**
 * Controller for teacher student directory operations:
 * - Manual single student creation with dynamic password formula ${studentFirstName}@${schoolCode}
 * - Status transitions (ACTIVE <-> SUSPENDED)
 */

export const manualAddStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.userId;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'Teacher is not associated with a school.' });
      return;
    }

    const { fullName, email } = req.body;

    if (!fullName || !fullName.trim() || !email || !email.trim()) {
      res.status(400).json({ success: false, message: 'Full name and email are required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    // 1. Fetch school details for the dynamic password formula
    const { data: school } = await supabase
      .from('school')
      .select('name, registration_no')
      .eq('school_id', schoolId)
      .single();

    const schoolIdentifier = school?.name || school?.registration_no || 'JUET';
    const tempPassword = generateStudentTempPassword(cleanName, schoolIdentifier);

    // 2. Check if student already exists in public.student
    const { data: existingStudent } = await supabase
      .from('student')
      .select('student_id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingStudent) {
      res.status(400).json({ success: false, message: `A student with email ${cleanEmail} is already enrolled.` });
      return;
    }

    // 3. Create user in Supabase Auth
    let authId: string | undefined;
    const { data: authUser, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: tempPassword,
    });

    if (authErr) {
      // If auth user already exists, retrieve or proceed with fallback
      if (authErr.message.includes('already registered')) {
        console.warn(`Auth user ${cleanEmail} already registered in Auth.`);
      } else {
        res.status(400).json({ success: false, message: `Auth creation failed: ${authErr.message}` });
        return;
      }
    } else {
      authId = authUser.user?.id;
    }

    // 4. Insert record into public.student
    const { data: student, error: insertErr } = await supabase
      .from('student')
      .insert({
        school_id: schoolId,
        teacher_id: teacherId,
        full_name: cleanName,
        email: cleanEmail,
        class: 12,
        status: 'NOT_COMPLETED',
      })
      .select()
      .single();

    if (insertErr) {
      res.status(400).json({ success: false, message: `Failed to insert student record: ${insertErr.message}` });
      return;
    }

    console.log(`[Manual Student Added] ${cleanName} (${cleanEmail}) -> Temp Password: ${tempPassword}`);

    res.status(201).json({
      success: true,
      message: `Student ${cleanName} added successfully.`,
      student,
      credentials: {
        name: cleanName,
        email: cleanEmail,
        temporaryPassword: tempPassword,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStudentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    const { studentId } = req.params;
    const { status } = req.body;

    if (!schoolId) {
      res.status(400).json({ success: false, message: 'Teacher is not associated with a school.' });
      return;
    }

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ success: false, message: 'Status must be ACTIVE or SUSPENDED.' });
      return;
    }

    // Verify student belongs to this teacher's school
    const { data: student, error: fetchErr } = await supabase
      .from('student')
      .select('student_id, full_name, school_id')
      .eq('student_id', studentId)
      .single();

    if (fetchErr || !student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    if (student.school_id !== schoolId) {
      res.status(403).json({ success: false, message: 'You can only update students from your school.' });
      return;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('student')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('student_id', studentId)
      .select()
      .single();

    if (updateErr) {
      res.status(400).json({ success: false, message: `Failed to update student status: ${updateErr.message}` });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Student ${student.full_name} status updated to ${status}.`,
      student: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
