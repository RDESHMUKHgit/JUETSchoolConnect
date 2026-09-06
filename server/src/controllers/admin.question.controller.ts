import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';
import { ENV } from '../config/env.js';

/**
 * Controller for Exam Admin Question Bank operations:
 * - Fetching all master questions with "previously asked" cross-referencing
 * - Creating new questions
 * - Editing questions
 * - Safe deletion of questions (protected if previously asked)
 */

export const getQuestionBank = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    const subject = req.query.subject as string;
    const search = req.query.search as string;
    const usage = req.query.usage as string; // 'ALL' | 'UNUSED' | 'USED'

    // 1. If usage filter is UNUSED or USED, prefetch used bank IDs
    let usedBankIds: string[] = [];
    if (usage === 'UNUSED' || usage === 'USED') {
      const { data: usedQuestions } = await supabase
        .from('questions')
        .select('bank_question_id')
        .not('bank_question_id', 'is', null);

      usedBankIds = Array.from(
        new Set((usedQuestions || []).map((q: any) => q.bank_question_id).filter(Boolean))
      );
    }

    // 2. Build filtered and paginated query
    let query = supabase
      .from('question_bank')
      .select('*', { count: 'exact' });

    if (subject && subject !== 'ALL') {
      query = query.eq('subject_name', subject);
    }

    if (search && search.trim()) {
      query = query.ilike('question_text', `%${search.trim()}%`);
    }

    if (usage === 'USED') {
      if (usedBankIds.length === 0) {
        res.status(200).json({ success: true, total: 0, page, limit, questions: [] });
        return;
      }
      query = query.in('bank_question_id', usedBankIds);
    } else if (usage === 'UNUSED' && usedBankIds.length > 0) {
      query = query.not('bank_question_id', 'in', `(${usedBankIds.join(',')})`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: bankQuestions, count, error: bankErr } = await query;

    if (bankErr) {
      res.status(500).json({ success: false, message: 'Failed to fetch question bank: ' + bankErr.message });
      return;
    }

    const currentQuestions = bankQuestions || [];
    const currentBankIds = currentQuestions.map((q: any) => q.bank_question_id).filter(Boolean);

    // 3. Fast indexed lookup of active usage ONLY for the current page's slice!
    let activeSliceQuestions: any[] = [];
    if (currentBankIds.length > 0) {
      const { data: activeData } = await supabase
        .from('questions')
        .select('bank_question_id, question_text, mock_test:mock_test_id(mock_test_id, title)')
        .in('bank_question_id', currentBankIds);

      activeSliceQuestions = activeData || [];
    }

    const usageByBankId = new Map<string, Array<{ testId: string; title: string }>>();
    activeSliceQuestions.forEach((aq: any) => {
      const testInfo = {
        testId: aq.mock_test?.mock_test_id || '',
        title: aq.mock_test?.title || 'Untitled Examination',
      };
      if (aq.bank_question_id) {
        const existing = usageByBankId.get(aq.bank_question_id) || [];
        existing.push(testInfo);
        usageByBankId.set(aq.bank_question_id, existing);
      }
    });

    // 4. Enrich current page slice
    const enrichedQuestions = currentQuestions.map((bq: any) => {
      const usagesFromId = usageByBankId.get(bq.bank_question_id) || [];
      const uniqueUsagesMap = new Map<string, { testId: string; title: string }>();
      usagesFromId.forEach((u) => {
        if (u.testId) uniqueUsagesMap.set(u.testId, u);
      });
      const usedInTests = Array.from(uniqueUsagesMap.values());

      return {
        ...bq,
        is_used: usedInTests.length > 0,
        usage_count: usedInTests.length,
        used_in_tests: usedInTests,
      };
    });

    res.status(200).json({
      success: true,
      total: count || 0,
      page,
      limit,
      questions: enrichedQuestions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      question_text,
      subject_name,
      question_type = 'MCQ',
      marks_per_question = 4,
      negative_marking = 1,
      option_array,
      answers,
      explanation,
      difficulty = 'MEDIUM',
      topic,
      question_image_url,
    } = req.body;

    if (!question_text || !question_text.trim()) {
      res.status(400).json({ success: false, message: 'Question text is required.' });
      return;
    }

    if (!option_array || !Array.isArray(option_array) || option_array.length < 2) {
      res.status(400).json({ success: false, message: 'At least 2 options are required.' });
      return;
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ success: false, message: 'Correct answer selection is required.' });
      return;
    }

    // Lookup subject_id by subject_name if available
    let subjectId: string | null = null;
    if (subject_name) {
      const { data: subject } = await supabase
        .from('subject')
        .select('subject_id')
        .ilike('name', subject_name.trim())
        .maybeSingle();

      if (subject) subjectId = subject.subject_id;
    }

    const { data: newQuestion, error: insertErr } = await supabase
      .from('question_bank')
      .insert({
        question_text: question_text.trim(),
        subject_name: (subject_name || 'Mathematics').trim(),
        subject_id: subjectId,
        question_type,
        marks_per_question: Number(marks_per_question) || 4,
        negative_marking: Number(negative_marking) || 1,
        option_array,
        answers,
        explanation: explanation ? explanation.trim() : null,
        difficulty,
        topic: topic ? topic.trim() : null,
        question_image_url: question_image_url || null,
      })
      .select()
      .single();

    if (insertErr) {
      res.status(400).json({ success: false, message: 'Failed to create question: ' + insertErr.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Question created successfully in Question Bank.',
      question: {
        ...newQuestion,
        is_used: false,
        used_in_tests: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      question_text,
      subject_name,
      marks_per_question,
      negative_marking,
      option_array,
      answers,
      explanation,
      difficulty,
      topic,
      question_image_url,
    } = req.body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (question_text !== undefined) updatePayload.question_text = question_text.trim();
    if (subject_name !== undefined) updatePayload.subject_name = subject_name.trim();
    if (marks_per_question !== undefined) updatePayload.marks_per_question = Number(marks_per_question);
    if (negative_marking !== undefined) updatePayload.negative_marking = Number(negative_marking);
    if (option_array !== undefined) updatePayload.option_array = option_array;
    if (answers !== undefined) updatePayload.answers = answers;
    if (explanation !== undefined) updatePayload.explanation = explanation;
    if (difficulty !== undefined) updatePayload.difficulty = difficulty;
    if (topic !== undefined) updatePayload.topic = topic;
    if (question_image_url !== undefined) updatePayload.question_image_url = question_image_url;

    const { data: updated, error: updateErr } = await supabase
      .from('question_bank')
      .update(updatePayload)
      .eq('bank_question_id', id)
      .select()
      .single();

    if (updateErr) {
      res.status(400).json({ success: false, message: 'Failed to update question: ' + updateErr.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully.',
      question: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBankQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Check if the question is used in any active mock tests
    const { data: usedQuestions, error: checkErr } = await supabase
      .from('questions')
      .select('question_id, mock_test:mock_test_id(title)')
      .eq('bank_question_id', id);

    if (checkErr) {
      res.status(500).json({ success: false, message: 'Error checking question usage: ' + checkErr.message });
      return;
    }

    if (usedQuestions && usedQuestions.length > 0) {
      const testTitles = usedQuestions.map((q: any) => q.mock_test?.title).filter(Boolean).join(', ');
      res.status(400).json({
        success: false,
        message: `Cannot delete: This question has already been used in mock tests (${testTitles}).`,
      });
      return;
    }

    // 2. Perform safe deletion
    const { error: delErr } = await supabase
      .from('question_bank')
      .delete()
      .eq('bank_question_id', id);

    if (delErr) {
      res.status(400).json({ success: false, message: 'Failed to delete question: ' + delErr.message });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully from Question Bank.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Exam Admin uploads an image for a question (Max 300 KB).
 * Authenticates with Supabase to bypass Storage RLS policies and uploads directly to 'question-images'.
 */
let cachedStorageToken: string | null = null;
let tokenExpiresAt = 0;

async function getAuthenticatedStorageClient() {
  const now = Date.now();
  if (cachedStorageToken && now < tokenExpiresAt) {
    return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
      global: { headers: { Authorization: `Bearer ${cachedStorageToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  const email = process.env.EXAM_ADMIN_EMAIL || 'examadmin@jaypee.ac.in';
  const password = process.env.EXAM_ADMIN_PASSWORD || 'ExamAdmin@Jaypee2026!';

  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authErr || !authData?.session) {
    throw new Error('Failed to authenticate storage client: ' + (authErr?.message || 'No session'));
  }

  cachedStorageToken = authData.session.access_token;
  tokenExpiresAt = now + (authData.session.expires_in ? (authData.session.expires_in - 300) * 1000 : 3300 * 1000);

  return createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${cachedStorageToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const uploadQuestionImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileBase64, fileName, mimeType } = req.body;

    if (!fileBase64) {
      res.status(400).json({ success: false, message: 'Image data (fileBase64) is required.' });
      return;
    }

    // Strip data URL prefix if present: "data:image/png;base64,..."
    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Strict 300 KB enforcement
    if (buffer.length > 300 * 1024) {
      res.status(400).json({ success: false, message: 'File size exceeds 300 KB limit.' });
      return;
    }

    const cleanMime = mimeType || 'image/png';
    const ext = (fileName?.split('.').pop() || 'png').toLowerCase();
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const storageClient = await getAuthenticatedStorageClient();

    const { data, error: uploadError } = await storageClient.storage
      .from('question-images')
      .upload(cleanFileName, buffer, {
        contentType: cleanMime,
        upsert: true,
      });

    if (uploadError) {
      res.status(400).json({ success: false, message: 'Storage upload failed: ' + uploadError.message });
      return;
    }

    const { data: urlData } = storageClient.storage
      .from('question-images')
      .getPublicUrl(data.path);

    res.status(200).json({
      success: true,
      message: 'Question image uploaded successfully.',
      publicUrl: urlData.publicUrl,
    });
  } catch (err: any) {
    console.error('[UploadQuestionImage Error]', err);
    res.status(500).json({ success: false, message: err.message || 'Image upload failed.' });
  }
};
