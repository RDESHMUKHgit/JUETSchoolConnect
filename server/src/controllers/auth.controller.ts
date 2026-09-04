import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.utils.js';
import { JwtUserPayload, UserRole } from '../types/auth.types.js';

export const registerPrincipalInit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
      return;
    }

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: 'PRINCIPAL' } },
    });

    if (authError) {
      res.status(400).json({ success: false, message: authError.message });
      return;
    }

    const authId = authData.user?.id;

    // 2. Insert into public.principal with initial status NOT_COMPLETED and school_id NULL
    const { data: principalData, error: dbError } = await supabase
      .from('principal')
      .insert([
        {
          full_name,
          email,
          auth_id: authId,
          status: 'NOT_COMPLETED',
          school_id: null,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('[Principal Init Insert Error]', dbError);
      res.status(500).json({ success: false, message: 'Failed to record principal account. ' + dbError.message });
      return;
    }

    const payload: JwtUserPayload = {
      userId: principalData.principal_id,
      authId,
      email: principalData.email,
      role: 'PRINCIPAL',
      status: 'NOT_COMPLETED',
      fullName: principalData.full_name,
      schoolId: null,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please complete your principal profile.',
      user: payload,
      nextStep: '/principal/profile-setup',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completePrincipalProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'PRINCIPAL') {
      res.status(403).json({ success: false, message: 'Access denied. Principal role required.' });
      return;
    }

    const { phone, gender, designation, profile_photo_url } = req.body;

    const { data: updated, error } = await supabase
      .from('principal')
      .update({
        phone,
        gender,
        designation: designation || 'P',
        profile_photo_url,
        status: 'COMPLETED',
        updated_at: new Date().toISOString(),
      })
      .eq('principal_id', user.userId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to update principal profile: ' + error.message });
      return;
    }

    const isAlreadyVerified = user.status === 'VERIFIED' || user.status === 'ACTIVE';
    const targetStatus = isAlreadyVerified ? user.status : 'COMPLETED';

    const payload: JwtUserPayload = {
      userId: user.userId,
      authId: user.authId,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      schoolName: user.schoolName,
      status: targetStatus,
      fullName: updated.full_name,
      phone: updated.phone,
      designation: updated.designation,
      profile_photo_url: updated.profile_photo_url,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: isAlreadyVerified
        ? 'Profile details updated successfully!'
        : 'Profile details saved. Now please provide your school details.',
      user: payload,
      nextStep: isAlreadyVerified ? '/principal' : '/principal/school-setup',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitSchoolDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'PRINCIPAL') {
      res.status(403).json({ success: false, message: 'Principal role required.' });
      return;
    }

    const {
      name,
      state,
      city,
      pin,
      board_affiliation,
      registration_no,
      contact_email,
      official_phone,
      website_url,
      school_type,
      medium_of_institution,
    } = req.body;

    if (!name || !state || !city) {
      res.status(400).json({ success: false, message: 'School name, state, and city are mandatory.' });
      return;
    }

    // 1. Insert into public.school with status PENDING
    const { data: schoolData, error: schoolErr } = await supabase
      .from('school')
      .insert([
        {
          name,
          state,
          city,
          pin,
          board_affiliation: board_affiliation || 'CBSE',
          registration_no: registration_no || `SCH-${Date.now()}`,
          contact_email: contact_email || user.email,
          official_phone,
          website_url,
          school_type: school_type || 'PRIVATE',
          medium_of_institution: medium_of_institution || 'ENGLISH',
          status: 'PENDING',
        },
      ])
      .select()
      .single();

    if (schoolErr) {
      res.status(400).json({ success: false, message: 'Failed to create school record: ' + schoolErr.message });
      return;
    }

    // 2. Link school_id to principal and set principal status to PENDING
    const { error: linkErr } = await supabase
      .from('principal')
      .update({
        school_id: schoolData.school_id,
        status: 'PENDING',
        updated_at: new Date().toISOString(),
      })
      .eq('principal_id', user.userId);

    if (linkErr) {
      res.status(500).json({ success: false, message: 'Failed to link principal to school: ' + linkErr.message });
      return;
    }

    const payload: JwtUserPayload = {
      userId: user.userId,
      authId: user.authId,
      email: user.email,
      role: user.role,
      schoolId: schoolData.school_id,
      schoolName: schoolData.name,
      status: 'PENDING',
      fullName: user.fullName,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'School registration submitted successfully! Your account is now under verification by Central Platform Administration.',
      user: payload,
      nextStep: '/principal/verification',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerStudentInit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, school_id, teacher_id } = req.body;

    if (!full_name || !email || !password) {
      res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
      return;
    }

    // Validate school and teacher relation if provided
    if (school_id && teacher_id) {
      const { data: teacherRec, error: tErr } = await supabase
        .from('teachers')
        .select('teacher_id, school_id, status')
        .eq('teacher_id', teacher_id)
        .single();

      if (tErr || !teacherRec || teacherRec.school_id !== school_id || !['ACTIVE', 'VERIFIED'].includes(teacherRec.status)) {
        res.status(400).json({
          success: false,
          message: 'The selected teacher is not a verified faculty member of the selected institution.',
        });
        return;
      }
    }

    // 1. Supabase Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: 'STUDENT' } },
    });

    if (authError) {
      res.status(400).json({ success: false, message: authError.message });
      return;
    }

    const authId = authData.user?.id;

    // 2. Insert into public.student with Class 12, status NOT_COMPLETED
    const { data: studentData, error: dbErr } = await supabase
      .from('student')
      .insert([
        {
          full_name,
          email,
          auth_id: authId,
          class: 12,
          status: 'NOT_COMPLETED',
          school_id: school_id || null,
          teacher_id: teacher_id || null,
        },
      ])
      .select()
      .single();

    if (dbErr) {
      res.status(500).json({ success: false, message: 'Failed to create student profile: ' + dbErr.message });
      return;
    }

    const payload: JwtUserPayload = {
      userId: studentData.student_id,
      authId,
      email: studentData.email,
      role: 'STUDENT',
      status: 'NOT_COMPLETED',
      fullName: studentData.full_name,
      schoolId: studentData.school_id,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Student account created. Please complete details.',
      user: payload,
      nextStep: '/student/profile-setup',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completeStudentProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'STUDENT') {
      res.status(403).json({ success: false, message: 'Student role required.' });
      return;
    }

    const {
      school_id,
      teacher_id,
      phone_no,
      admission_no,
      apaar,
      dob,
      gender,
      profile_photo_url,
      new_password,
      current_password,
    } = req.body;

    // Retrieve existing student record
    const { data: currentStudent, error: fetchErr } = await supabase
      .from('student')
      .select('*, school:school_id(school_id, name)')
      .eq('student_id', user.userId)
      .single();

    if (fetchErr || !currentStudent) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    // Determine target school ID (either existing teacher-linked school or passed ID)
    const effectiveSchoolId = currentStudent.school_id || school_id;

    if (!effectiveSchoolId) {
      res.status(400).json({ success: false, message: 'Student must be linked to an accredited school.' });
      return;
    }

    // 1. One-time Password Update (if student is in NOT_COMPLETED status)
    if (new_password) {
      if (new_password.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        return;
      }

      console.log(`🔐 Updating one-time permanent password for student: ${user.email}`);

      // Attempt to sign in to obtain an authenticated session for updating password
      const authClient = supabase;
      let sessionEstablished = false;

      // Try with provided current_password
      if (current_password) {
        const { error: signErr } = await authClient.auth.signInWithPassword({
          email: user.email,
          password: current_password,
        });
        if (!signErr) sessionEstablished = true;
      }

      // If no current_password or sign-in failed, attempt using formula password
      if (!sessionEstablished && currentStudent.school) {
        const { generateStudentTempPassword } = await import('../utils/student.utils.js');
        const tempFormulaPassword = generateStudentTempPassword(currentStudent.full_name, currentStudent.school.name);
        const { error: formulaSignErr } = await authClient.auth.signInWithPassword({
          email: user.email,
          password: tempFormulaPassword,
        });
        if (!formulaSignErr) sessionEstablished = true;
      }

      if (sessionEstablished) {
        const { error: updPwErr } = await authClient.auth.updateUser({ password: new_password });
        if (updPwErr && !updPwErr.message.includes('should be different')) {
          console.warn('⚠️ Supabase Auth password update notice:', updPwErr.message);
        } else {
          console.log(`✅ Permanent password successfully set for student: ${user.email}`);
        }
      }
    }

    // 2. Update Student Profile in database
    const updateData: Record<string, any> = {
      phone_no: phone_no || currentStudent.phone_no,
      admission_no: admission_no || currentStudent.admission_no,
      apaar: apaar || currentStudent.apaar,
      dob: dob || currentStudent.dob,
      gender: gender || currentStudent.gender,
      class: 12,
      status: 'PENDING', // Status becomes PENDING for teacher verification!
      updated_at: new Date().toISOString(),
    };

    if (profile_photo_url) {
      updateData.profile_photo_url = profile_photo_url;
    }

    if (teacher_id) {
      updateData.teacher_id = teacher_id;
    }

    if (!currentStudent.school_id && effectiveSchoolId) {
      updateData.school_id = effectiveSchoolId;
    }

    const { data: updated, error: updErr } = await supabase
      .from('student')
      .update(updateData)
      .eq('student_id', user.userId)
      .select('*, school:school_id(school_id, name)')
      .single();

    if (updErr) {
      res.status(400).json({ success: false, message: 'Failed to update student profile: ' + updErr.message });
      return;
    }

    const payload: JwtUserPayload = {
      userId: user.userId,
      authId: user.authId,
      email: user.email,
      role: user.role,
      schoolId: updated.school_id,
      schoolName: updated.school?.name || user.schoolName,
      status: 'PENDING',
      fullName: updated.full_name,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Password set and profile submitted! Your details have been sent to your teacher for verification.',
      user: payload,
      nextStep: '/student/verification',
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public Role Login: Handles Student, Teacher, Principal.
 * Strictly NO ADMIN role permitted through this endpoint!
 */
export const publicLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
      return;
    }

    if (role === 'ADMIN') {
      res.status(403).json({ success: false, message: 'Invalid role selection.' });
      return;
    }

    // 1. Sign in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
      return;
    }

    const authId = authData.user.id;
    let userRecord: any = null;
    let schoolName: string | null = null;
    let schoolId: string | null = null;

    if (role === 'PRINCIPAL') {
      const { data: p } = await supabase
        .from('principal')
        .select('*, school:school_id(name, status)')
        .or(`auth_id.eq.${authId},email.eq.${email}`)
        .maybeSingle();

      if (!p) {
        res.status(404).json({ success: false, message: 'No Principal account found matching these credentials.' });
        return;
      }
      userRecord = {
        userId: p.principal_id,
        email: p.email,
        fullName: p.full_name,
        role: 'PRINCIPAL',
        status: p.status,
        phone: p.phone || null,
        designation: p.designation || null,
        profile_photo_url: p.profile_photo_url || null,
      };
      schoolId = p.school_id;
      schoolName = p.school?.name || null;
    } else if (role === 'TEACHER') {
      const { data: t } = await supabase
        .from('teachers')
        .select('*, school:school_id(name, status)')
        .or(`auth_id.eq.${authId},email.eq.${email}`)
        .maybeSingle();

      if (!t) {
        res.status(404).json({ success: false, message: 'No Teacher account found matching these credentials.' });
        return;
      }
      userRecord = {
        userId: t.teacher_id,
        email: t.email,
        fullName: t.full_name,
        role: 'TEACHER',
        status: t.status,
        phone: t.phone || null,
        designation: t.designation || null,
        department: t.department || null,
        profile_photo_url: t.profile_photo_url || null,
      };
      schoolId = t.school_id;
      schoolName = t.school?.name || null;
    } else if (role === 'STUDENT') {
      const { data: s } = await supabase
        .from('student')
        .select('*, school:school_id(name, status)')
        .or(`auth_id.eq.${authId},email.eq.${email}`)
        .maybeSingle();

      if (!s) {
        res.status(404).json({ success: false, message: 'No Student account found matching these credentials.' });
        return;
      }
      userRecord = {
        userId: s.student_id,
        email: s.email,
        fullName: s.full_name,
        role: 'STUDENT',
        status: s.status,
        phone: s.phone_no || null,
        phone_no: s.phone_no || null,
        admission_no: s.admission_no || null,
        apaar: s.apaar || null,
        class: s.class || 12,
        profile_photo_url: s.profile_photo_url || null,
      };
      schoolId = s.school_id;
      schoolName = s.school?.name || null;
    }

    const payload: JwtUserPayload = {
      userId: userRecord.userId,
      authId,
      email: userRecord.email,
      role: userRecord.role,
      status: userRecord.status,
      fullName: userRecord.fullName,
      schoolId,
      schoolName,
      phone: userRecord.phone || userRecord.phone_no || null,
      phone_no: userRecord.phone_no || userRecord.phone || null,
      profile_photo_url: userRecord.profile_photo_url || null,
      designation: userRecord.designation || null,
      department: userRecord.department || null,
      apaar: userRecord.apaar || null,
      admission_no: userRecord.admission_no || null,
      class: userRecord.class || null,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    // Compute navigation destination based on role and status
    let redirectUrl = `/${role.toLowerCase()}`;
    if (userRecord.status === 'NOT_COMPLETED' || userRecord.status === 'NOT COMPLETED') {
      redirectUrl = `/${role.toLowerCase()}/profile-setup`;
    } else if (role === 'PRINCIPAL' && userRecord.status === 'COMPLETED') {
      redirectUrl = `/principal/school-setup`;
    } else if (userRecord.status === 'PENDING') {
      redirectUrl = `/${role.toLowerCase()}/verification`;
    } else if (userRecord.status === 'VERIFIED' || userRecord.status === 'ACTIVE') {
      redirectUrl = `/${role.toLowerCase()}`;
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${payload.fullName || 'User'}!`,
      user: payload,
      redirectUrl,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Dedicated Hidden Admin Login (/admin)
 */
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Admin email and password are required.' });
      return;
    }

    // 1. Supabase Auth sign-in
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
      return;
    }

    // 2. Verify account exists in public.admin
    const { data: adminRecord, error: adminErr } = await supabase
      .from('admin')
      .select('*')
      .or(`auth_id.eq.${authData.user.id},email.eq.${email}`)
      .maybeSingle();

    if (adminErr || !adminRecord) {
      res.status(403).json({ success: false, message: 'Access denied. Account is not registered as Platform Administrator.' });
      return;
    }

    const isExamAdmin = adminRecord.role === 'EXAM_ADMIN' || adminRecord.email === 'examadmin@jaypee.ac.in';
    const effectiveRole: UserRole = isExamAdmin ? 'EXAM_ADMIN' : (adminRecord.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN');
    const redirectUrl = isExamAdmin ? '/admin/exam' : '/admin';

    const payload: JwtUserPayload = {
      userId: adminRecord.admin_id,
      authId: adminRecord.auth_id,
      email: adminRecord.email,
      role: effectiveRole,
      status: 'VERIFIED',
      fullName: adminRecord.full_name,
      schoolId: null,
    };

    const token = signToken(payload);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: `${isExamAdmin ? 'Examination' : 'Platform'} Administrator authenticated.`,
      user: payload,
      redirectUrl,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  // Refresh latest status from DB
  let currentStatus = req.user.status;
  let schoolName = req.user.schoolName;
  let schoolId = req.user.schoolId;
  let effectiveRole = req.user.role;

  try {
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.role === 'EXAM_ADMIN') {
      const { data } = await supabase
        .from('admin')
        .select('status, full_name, role, email')
        .eq('admin_id', req.user.userId)
        .maybeSingle();
      if (data) {
        currentStatus = data.status as any;
        const isExamAdmin = data.role === 'EXAM_ADMIN' || data.email === 'examadmin@jaypee.ac.in';
        effectiveRole = isExamAdmin ? 'EXAM_ADMIN' : (data.role as any);
      }
    } else if (req.user.role === 'PRINCIPAL') {
      const { data } = await supabase
        .from('principal')
        .select('status, school_id, full_name, email, phone, gender, designation, profile_photo_url, school:school_id(name)')
        .eq('principal_id', req.user.userId)
        .maybeSingle();
      if (data) {
        currentStatus = data.status as any;
        schoolId = data.school_id;
        schoolName = (data.school as any)?.name || schoolName;
        req.user.fullName = data.full_name || req.user.fullName;
        req.user.phone = data.phone || null;
        req.user.designation = data.designation || null;
        req.user.profile_photo_url = data.profile_photo_url || null;
      }
    } else if (req.user.role === 'TEACHER') {
      const { data } = await supabase
        .from('teachers')
        .select('status, school_id, full_name, email, phone, designation, department, profile_photo_url, school:school_id(name)')
        .eq('teacher_id', req.user.userId)
        .maybeSingle();
      if (data) {
        currentStatus = data.status as any;
        schoolId = data.school_id;
        schoolName = (data.school as any)?.name || schoolName;
        req.user.fullName = data.full_name || req.user.fullName;
        req.user.phone = data.phone || null;
        req.user.designation = data.designation || null;
        req.user.department = data.department || null;
        req.user.profile_photo_url = data.profile_photo_url || null;
      }
    } else if (req.user.role === 'STUDENT') {
      const { data } = await supabase
        .from('student')
        .select('status, school_id, full_name, email, phone_no, admission_no, apaar, dob, gender, class, profile_photo_url, school:school_id(name)')
        .eq('student_id', req.user.userId)
        .maybeSingle();
      if (data) {
        currentStatus = data.status as any;
        schoolId = data.school_id;
        schoolName = (data.school as any)?.name || schoolName;
        req.user.fullName = data.full_name || req.user.fullName;
        req.user.phone = data.phone_no || null;
        req.user.phone_no = data.phone_no || null;
        req.user.admission_no = data.admission_no || null;
        req.user.apaar = data.apaar || null;
        req.user.class = data.class || 12;
        req.user.profile_photo_url = data.profile_photo_url || null;
      }
    }
  } catch (e) {
    // Keep cached user on error
  }

  const payload: JwtUserPayload = {
    ...req.user,
    role: effectiveRole,
    status: currentStatus,
    schoolId,
    schoolName,
  };

  res.status(200).json({
    success: true,
    user: payload,
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: 'Successfully logged out.' });
};
