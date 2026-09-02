import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const schoolId = req.user?.schoolId;
    let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });

    if (schoolId) {
      query = query.or(`scope.eq.PLATFORM,school_id.eq.${schoolId}`);
    } else {
      query = query.eq('scope', 'PLATFORM');
    }

    const { data, error } = await query;
    if (error) {
      // Return empty array if table does not exist yet
      res.status(200).json({ success: true, announcements: [] });
      return;
    }

    res.status(200).json({ success: true, announcements: data || [] });
  } catch (err: any) {
    res.status(200).json({ success: true, announcements: [] });
  }
};

export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, content, priority } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required.' });
      return;
    }

    const isPlatformAdmin = user.role === 'ADMIN';
    const scope = isPlatformAdmin ? 'PLATFORM' : 'SCHOOL';
    const schoolId = isPlatformAdmin ? null : user.schoolId;

    const { data, error } = await supabase
      .from('announcements')
      .insert([
        {
          title,
          content,
          scope,
          school_id: schoolId,
          created_by_role: user.role,
          created_by_id: user.userId,
          priority: priority || 'NORMAL',
        },
      ])
      .select()
      .single();

    if (error) {
      res.status(400).json({ success: false, message: 'Failed to create announcement: ' + error.message });
      return;
    }

    res.status(201).json({ success: true, message: 'Announcement broadcasted successfully.', announcement: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
