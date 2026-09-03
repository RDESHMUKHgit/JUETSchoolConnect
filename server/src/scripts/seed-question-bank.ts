import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cedklyodapmquxlancvg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_p4Ekx-sCQ7-DB0iuFsT0gg_eN94x42x';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Helper to normalize option format
function formatOptionArray(rawOptions: any[]): Array<{ key: string; text: string }> {
  if (!Array.isArray(rawOptions)) return [];
  return rawOptions.map((opt, idx) => {
    if (typeof opt === 'string') {
      return {
        key: OPTION_KEYS[idx] || String.fromCharCode(65 + idx),
        text: opt,
      };
    }
    if (typeof opt === 'object' && opt !== null) {
      return {
        key: opt.key || OPTION_KEYS[idx] || String.fromCharCode(65 + idx),
        text: String(opt.text || opt.value || ''),
      };
    }
    return {
      key: OPTION_KEYS[idx] || String.fromCharCode(65 + idx),
      text: String(opt),
    };
  });
}

// Helper to map answers to standard option keys (A, B, C, D)
function mapAnswerToKeys(rawAnswers: any): string[] {
  if (!rawAnswers) return ['A'];
  const ansArray = Array.isArray(rawAnswers) ? rawAnswers : [rawAnswers];
  return ansArray.map((ans) => {
    const str = String(ans).trim();
    // If it is 1, 2, 3, 4 (1-based index from jee_paper.json)
    const num = parseInt(str, 10);
    if (!isNaN(num) && num >= 1 && num <= 6) {
      return OPTION_KEYS[num - 1];
    }
    // If it is already A, B, C, D
    if (OPTION_KEYS.includes(str.toUpperCase())) {
      return str.toUpperCase();
    }
    return 'A';
  });
}

async function seedQuestionBank() {
  console.log('--- Starting Question Bank Seeding ---');

  // 1. Fetch Subject IDs from DB
  const { data: subjects, error: subjErr } = await supabase.from('subject').select('subject_id, name');
  if (subjErr) {
    console.error('Error fetching subjects:', subjErr.message);
    process.exit(1);
  }

  const subjectMap = new Map<string, string>();
  subjects?.forEach((s: any) => subjectMap.set(s.name.toLowerCase().trim(), s.subject_id));

  // 2. Read jee_paper.json
  const paperPath = path.resolve(__dirname, '../../../client/jee_paper.json');
  if (!fs.existsSync(paperPath)) {
    console.error(`Questions source file not found at: ${paperPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(paperPath, 'utf-8');
  const questionsList: any[] = JSON.parse(rawData);
  console.log(`Loaded ${questionsList.length} questions from jee_paper.json`);

  // 3. Clear existing question_bank records to allow clean re-seed
  const { error: clearErr } = await supabase.from('question_bank').delete().neq('question_number', -999);
  if (clearErr) {
    console.warn('Note on clearing question_bank:', clearErr.message);
  }

  // 4. Transform and prepare records
  const records = questionsList.map((q, index) => {
    const subjName = (q.subject || 'Mathematics').trim();
    const subjId = subjectMap.get(subjName.toLowerCase()) || null;

    return {
      question_number: q.question_number || index + 1,
      subject_id: subjId,
      subject_name: subjName,
      question_type: q.question_type || 'MCQ',
      marks_per_question: Number(q.marks_per_question) || 4,
      negative_marking: Number(q.negative_marking) || 1,
      question_text: q.question_text || '',
      option_array: formatOptionArray(q.option_array),
      answers: mapAnswerToKeys(q.answers),
      explanation: q.explanation || null,
      difficulty: q.difficulty || 'MEDIUM',
      topic: q.topic || null,
      question_image_url: q.question_image_url || null,
    };
  });

  // 5. Insert in chunks of 25
  const chunkSize = 25;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { data, error } = await supabase.from('question_bank').insert(chunk).select('bank_question_id');

    if (error) {
      console.error(`Error inserting chunk ${i / chunkSize + 1}:`, error.message);
    } else {
      totalInserted += data?.length || 0;
      console.log(`Inserted chunk ${i / chunkSize + 1} (${totalInserted}/${records.length} records)`);
    }
  }

  console.log(`✅ Question Bank successfully seeded! Total inserted: ${totalInserted} questions.`);
}

seedQuestionBank()
  .catch((err) => {
    console.error('Fatal seeding error:', err);
    process.exit(1);
  });
