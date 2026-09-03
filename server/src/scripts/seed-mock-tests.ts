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

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function mapAnswerToKey(answers: any): string {
  if (!answers) return 'A';
  if (typeof answers === 'string') {
    const trimmed = answers.trim();
    if (['A', 'B', 'C', 'D'].includes(trimmed.toUpperCase())) return trimmed.toUpperCase();
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 1 && num <= 4) return OPTION_KEYS[num - 1];
    return trimmed;
  }
  if (Array.isArray(answers) && answers.length > 0) {
    return mapAnswerToKey(answers[0]);
  }
  if (typeof answers === 'object') {
    return answers.correct || answers.correct_option || answers.key || 'A';
  }
  return 'A';
}

function formatOptions(rawOptions: any[] | null): Array<{ key: string; text: string }> {
  if (!rawOptions || !Array.isArray(rawOptions)) {
    return [
      { key: 'A', text: 'Option A' },
      { key: 'B', text: 'Option B' },
      { key: 'C', text: 'Option C' },
      { key: 'D', text: 'Option D' },
    ];
  }
  return rawOptions.map((opt, idx) => {
    if (typeof opt === 'object' && opt !== null && opt.key && opt.text) {
      return opt;
    }
    const key = OPTION_KEYS[idx] || String(idx + 1);
    return { key, text: String(opt) };
  });
}

export async function seedMockTests(): Promise<void> {
  console.log('====================================================');
  console.log('🌱 JAYPEE SCHOOL CONNECT — MOCK TEST SEED SCRIPT');
  console.log('====================================================');

  try {
    // 1. Locate jee_paper.json
    const possiblePaths = [
      path.resolve(process.cwd(), '../client/jee_paper.json'),
      path.resolve(process.cwd(), 'client/jee_paper.json'),
      path.resolve(__dirname, '../../../client/jee_paper.json'),
    ];
    let paperPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        paperPath = p;
        break;
      }
    }

    if (!paperPath) {
      console.error('❌ Could not locate jee_paper.json in known paths.');
      return;
    }

    console.log(`Loading questions from: ${paperPath}`);
    const fileContent = fs.readFileSync(paperPath, 'utf-8');
    const allQuestions: any[] = JSON.parse(fileContent);
    console.log(`Found ${allQuestions.length} total questions in paper.`);

    // 2. Ensure Exam record exists
    let examId: string | null = null;
    const { data: existingExam } = await supabase
      .from('exam')
      .select('exam_id')
      .eq('name', 'JEE Main 2026')
      .maybeSingle();

    if (existingExam) {
      examId = existingExam.exam_id;
    } else {
      const { data: newExam, error: examErr } = await supabase
        .from('exam')
        .insert([{ name: 'JEE Main 2026', description: 'National Testing Agency Joint Entrance Examination (Main)' }])
        .select()
        .single();
      if (!examErr && newExam) examId = newExam.exam_id;
    }

    // 3. Ensure Subject records exist
    const subjectMap: Record<string, string> = {};
    const subjects = ['Mathematics', 'Physics', 'Chemistry'];
    for (const subName of subjects) {
      const { data: existingSub } = await supabase
        .from('subject')
        .select('subject_id')
        .eq('name', subName)
        .maybeSingle();

      if (existingSub) {
        subjectMap[subName] = existingSub.subject_id;
      } else {
        const { data: newSub, error: subErr } = await supabase
          .from('subject')
          .insert([{ name: subName, description: `Class 12 CBSE / JEE ${subName}` }])
          .select()
          .single();
        if (!subErr && newSub) subjectMap[subName] = newSub.subject_id;
      }
    }

    // 4. Create Mock Test 1: Mathematics (5 questions)
    const mathQuestions = allQuestions.filter((q) => q.subject === 'Mathematics' && q.question_type === 'MCQ').slice(0, 5);
    if (mathQuestions.length > 0) {
      console.log(`\nCreating Mathematics Mock Test with 5 questions...`);
      const { data: mathTest, error: mTestErr } = await supabase
        .from('mock_test')
        .insert([
          {
            subject_id: subjectMap['Mathematics'] || null,
            exam_id: examId,
            title: 'JEE Main 2026 — Mathematics Speed Simulation',
            description: 'Calibrated 5-question high-yield mock assessment covering Algebra, Coordinate Geometry, and Calculus.',
            total_questions: 5,
            max_marks: 20,
            max_time_in_mins: 15,
            negative_marking: true,
            passing_marks: 8,
            instructions: '+4 for correct, -1 for incorrect. All questions are multiple choice single correct option.',
          },
        ])
        .select()
        .single();

      if (mTestErr || !mathTest) {
        console.error('❌ Failed to create Math mock test:', mTestErr?.message);
      } else {
        console.log(`✅ Created Mock Test: "${mathTest.title}" (ID: ${mathTest.mock_test_id})`);
        // Insert questions
        const questionsToInsert = mathQuestions.map((q) => {
          const correctKey = mapAnswerToKey(q.answers);
          return {
            mock_test_id: mathTest.mock_test_id,
            subject_id: subjectMap['Mathematics'] || null,
            question_text: q.question_text,
            question_type: 'MCQ',
            marks_per_question: q.marks_per_question || 4,
            negative_marking: q.negative_marking !== undefined ? q.negative_marking : 1,
            option_array: formatOptions(q.option_array),
            answers: { correct: correctKey, key: correctKey },
            question_image_url: q.question_image_url || null,
          };
        });

        const { error: qInsertErr } = await supabase.from('questions').insert(questionsToInsert);
        if (qInsertErr) {
          console.error('❌ Failed to insert math questions:', qInsertErr.message);
        } else {
          console.log(`✅ Successfully inserted 5 questions for Mathematics mock test!`);
        }
      }
    }

    // 5. Create Mock Test 2: Physics (5 questions)
    const physicsQuestions = allQuestions.filter((q) => q.subject === 'Physics' && q.question_type === 'MCQ').slice(0, 5);
    if (physicsQuestions.length > 0) {
      console.log(`\nCreating Physics Mock Test with 5 questions...`);
      const { data: physTest, error: pTestErr } = await supabase
        .from('mock_test')
        .insert([
          {
            subject_id: subjectMap['Physics'] || null,
            exam_id: examId,
            title: 'JEE Main 2026 — Physics Mechanics & Electrostatics',
            description: 'Standardized 5-question test paper focusing on Rotational Dynamics, Gravitation, and Capacitance.',
            total_questions: 5,
            max_marks: 20,
            max_time_in_mins: 15,
            negative_marking: true,
            passing_marks: 8,
            instructions: '+4 for correct, -1 for incorrect. Designed according to latest NTA JEE Main blueprints.',
          },
        ])
        .select()
        .single();

      if (pTestErr || !physTest) {
        console.error('❌ Failed to create Physics mock test:', pTestErr?.message);
      } else {
        console.log(`✅ Created Mock Test: "${physTest.title}" (ID: ${physTest.mock_test_id})`);
        const questionsToInsert = physicsQuestions.map((q) => {
          const correctKey = mapAnswerToKey(q.answers);
          return {
            mock_test_id: physTest.mock_test_id,
            subject_id: subjectMap['Physics'] || null,
            question_text: q.question_text,
            question_type: 'MCQ',
            marks_per_question: q.marks_per_question || 4,
            negative_marking: q.negative_marking !== undefined ? q.negative_marking : 1,
            option_array: formatOptions(q.option_array),
            answers: { correct: correctKey, key: correctKey },
            question_image_url: q.question_image_url || null,
          };
        });

        const { error: qInsertErr } = await supabase.from('questions').insert(questionsToInsert);
        if (qInsertErr) {
          console.error('❌ Failed to insert physics questions:', qInsertErr.message);
        } else {
          console.log(`✅ Successfully inserted 5 questions for Physics mock test!`);
        }
      }
    }

    console.log('\n====================================================');
    console.log('🎉 MOCK TESTS SEEDED SUCCESSFULLY WITH 5 QUESTIONS EACH!');
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Error seeding mock tests:', err.message);
  }
}

// Run seed script if executed directly
seedMockTests().catch(console.error);
