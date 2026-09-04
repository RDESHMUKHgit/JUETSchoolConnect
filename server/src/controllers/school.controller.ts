import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

/**
 * Public endpoint to fetch verified schools for the Student Registration Dropdown
 */
export const getVerifiedSchools = async (req: Request, res: Response): Promise<void> => {
  try {
    // In db_schema.sql, the verification status is stored on the principal record associated with the school
    const { data, error } = await supabase
      .from('principal')
      .select('school_id, status, school:school_id (school_id, name, city, state, board_affiliation, school_type)')
      .in('status', ['VERIFIED', 'ACTIVE']);

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch schools: ' + error.message });
      return;
    }

    const schools = (data || [])
      .map((item: any) => item.school)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      schools,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSchoolProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.params.id || req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School identifier is missing.' });
      return;
    }

    const { data, error } = await supabase
      .from('school')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (error || !data) {
      res.status(404).json({ success: false, message: 'School profile not found.' });
      return;
    }

    res.status(200).json({ success: true, school: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSchoolProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'User is not associated with a school.' });
      return;
    }

    const { official_phone, contact_email, website_url, pin } = req.body;

    const { data, error } = await supabase
      .from('school')
      .update({
        official_phone,
        contact_email,
        website_url,
        pin,
        updated_at: new Date().toISOString(),
      })
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to update school profile: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, message: 'School profile updated successfully.', school: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Public endpoint to fetch verified teachers of a specific school for the Student Registration Step 2
 */
export const getVerifiedTeachersForSchool = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      res.status(400).json({ success: false, message: 'School ID is required.' });
      return;
    }

    const { data, error } = await supabase
      .from('teachers')
      .select('teacher_id, full_name, email, department, designation, status')
      .eq('school_id', schoolId)
      .in('status', ['ACTIVE', 'VERIFIED'])
      .order('full_name', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch teachers: ' + error.message });
      return;
    }

    res.status(200).json({ success: true, teachers: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
