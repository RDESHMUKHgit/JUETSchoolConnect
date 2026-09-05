import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import {
  SUBJECTS,
  EXAMS,
  schools,
  principals,
  teachers,
  students,
  questionsBank,
  mockTests,
  mockTestSubjects,
  mockTestQuestions,
  attempts
} from '../../../dummy data/generate_seed_data.js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('====================================================');
console.log('🌱 SCHOOL CONNECT — DIRECT DATABASE SEEDER');
console.log('====================================================');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cedklyodapmquxlancvg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_p4Ekx-sCQ7-DB0iuFsT0gg_eN94x42x';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Helper for batch upserts
async function batchUpsert(tableName: string, records: any[], onConflictKey: string, batchSize = 100) {
  console.log(`\n⏳ Seeding ${records.length} records into "${tableName}"...`);
  for (let i = 0; i < records.length; i += batchSize) {
    const chunk = records.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: onConflictKey });
    if (error) {
      console.error(`\n❌ Error inserting into "${tableName}" [${i}..${i + chunk.length}]:`, error.message);
      throw error;
    }
    process.stdout.write(`   Progress: ${Math.min(i + chunk.length, records.length)} / ${records.length}\r`);
  }
  console.log(`\n✅ Finished "${tableName}" (${records.length} records).`);
}

async function runDirectSeed() {
  try {
    // 1. Subjects & Exams
    console.log('1. Seeding Subjects and Exams...');
    const subjectsToInsert = SUBJECTS.map(s => ({
      subject_id: s.id,
      name: s.name,
      description: s.desc
    }));
    await batchUpsert('subject', subjectsToInsert, 'name');

    const examsToInsert = EXAMS.map(e => ({
      exam_id: e.id,
      name: e.name,
      description: e.desc
    }));
    await batchUpsert('exam', examsToInsert, 'name');

    // 2. Schools & Principals
    console.log('\n2. Seeding Schools and Principals...');
    console.log(`   - Schools: ${schools.length}`);
    console.log(`   - Principals: ${principals.length}`);
    await batchUpsert('school', schools, 'school_id', 50);

    // Prepare principals with auth_id = null so foreign key won't block if auth user isn't created yet
    const principalsPayload = principals.map(p => ({
      ...p,
      auth_id: null
    }));
    await batchUpsert('principal', principalsPayload, 'principal_id', 50);

    // 3. Teachers
    console.log('\n3. Seeding Teachers...');
    console.log(`   - Teachers: ${teachers.length}`);
    const teachersPayload = teachers.map(t => ({
      ...t,
      auth_id: null
    }));
    await batchUpsert('teachers', teachersPayload, 'teacher_id', 100);

    // 4. Students
    console.log('\n4. Seeding Students...');
    console.log(`   - Students: ${students.length}`);
    const studentsPayload = students.map(st => ({
      ...st,
      auth_id: null
    }));
    await batchUpsert('student', studentsPayload, 'student_id', 150);

    // 5. Question Bank
    console.log('\n5. Seeding Question Bank...');
    console.log(`   - Questions: ${questionsBank.length}`);
    await batchUpsert('question_bank', questionsBank, 'bank_question_id', 50);

    // 6. Mock Tests & Questions
    console.log('\n6. Seeding Mock Tests and Attached Questions...');
    console.log(`   - Mock Tests: ${mockTests.length}`);
    await batchUpsert('mock_test', mockTests, 'mock_test_id', 20);

    console.log(`\n⏳ Linking ${mockTestSubjects.length} records into "mock_test_subjects"...`);
    for (let i = 0; i < mockTestSubjects.length; i += 50) {
      const chunk = mockTestSubjects.slice(i, i + 50);
      const { error } = await supabase.from('mock_test_subjects').upsert(chunk, { onConflict: 'mock_test_id,subject_id' });
      if (error) {
        console.error('Error inserting into mock_test_subjects:', error.message);
        throw error;
      }
    }
    console.log('✅ Finished "mock_test_subjects".');

    console.log(`   - Test Paper Questions: ${mockTestQuestions.length}`);
    await batchUpsert('questions', mockTestQuestions, 'question_id', 50);

    // 7. Test Attempts
    console.log('\n7. Seeding Realistic Test Attempts...');
    console.log(`   - Attempts: ${attempts.length}`);
    await batchUpsert('test_attempts', attempts, 'attempt_id', 100);

    console.log('\n====================================================');
    console.log('🎉 DIRECT SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`   - Schools: ${schools.length}`);
    console.log(`   - Principals: ${principals.length}`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Question Bank: ${questionsBank.length}`);
    console.log(`   - Mock Tests: ${mockTests.length}`);
    console.log(`   - Test Paper Questions: ${mockTestQuestions.length}`);
    console.log(`   - Test Attempts: ${attempts.length}`);
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Direct seeding failed:', err);
    process.exit(1);
  }
}

runDirectSeed();
