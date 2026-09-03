import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

const DEFAULT_EXAM_ADMIN = {
  fullName: 'Jaypee Examination Authority',
  email: process.env.EXAM_ADMIN_EMAIL || 'examadmin@jaypee.ac.in',
  password: process.env.EXAM_ADMIN_PASSWORD || 'ExamAdmin@Jaypee2026!',
  phone: '+91 98888 88888',
  role: 'EXAM_ADMIN',
  status: 'ACTIVE',
};

export async function seedExamAdmin(): Promise<void> {
  console.log('====================================================');
  console.log('🌱 JAYPEE SCHOOL CONNECT — EXAM ADMIN SEED SCRIPT');
  console.log('====================================================');
  console.log(`Checking existing exam admin for: ${DEFAULT_EXAM_ADMIN.email}...`);

  try {
    // 1. Check if admin record already exists in public.admin
    const { data: existingAdmin, error: checkErr } = await supabase
      .from('admin')
      .select('*')
      .eq('email', DEFAULT_EXAM_ADMIN.email)
      .maybeSingle();

    if (checkErr) {
      console.error('❌ Error checking public.admin table:', checkErr.message);
      return;
    }

    if (existingAdmin) {
      console.log('✅ Exam Admin record already exists in database:');
      console.log(`   - Admin ID : ${existingAdmin.admin_id}`);
      console.log(`   - Auth ID  : ${existingAdmin.auth_id}`);
      console.log(`   - Email    : ${existingAdmin.email}`);
      console.log(`   - Role     : ${existingAdmin.role}`);
      console.log(`   - Status   : ${existingAdmin.status}`);
      console.log('\n🔑 Login Credentials:');
      console.log(`   URL      : /admin`);
      console.log(`   Email    : ${DEFAULT_EXAM_ADMIN.email}`);
      console.log(`   Password : ${DEFAULT_EXAM_ADMIN.password}`);
      console.log('====================================================');
      return;
    }

    // 2. Register account in Supabase Auth
    console.log('Creating auth account in Supabase...');
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: DEFAULT_EXAM_ADMIN.email,
      password: DEFAULT_EXAM_ADMIN.password,
      options: {
        data: {
          full_name: DEFAULT_EXAM_ADMIN.fullName,
          role: 'EXAM_ADMIN',
        },
      },
    });

    let authId = authData?.user?.id;

    if (authErr && !authData?.user) {
      if (authErr.message.includes('already registered')) {
        console.log('ℹ️ Auth user already exists. Signing in to retrieve user ID...');
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: DEFAULT_EXAM_ADMIN.email,
          password: DEFAULT_EXAM_ADMIN.password,
        });
        if (loginErr || !loginData?.user) {
          console.error('❌ Could not sign in to existing auth user:', loginErr?.message);
          return;
        }
        authId = loginData.user.id;
      } else {
        console.error('❌ Failed to create Supabase Auth user:', authErr.message);
        return;
      }
    }
    if (!authId) {
      console.error('❌ User ID could not be retrieved from auth signup.');
      return;
    }

    console.log(`✅ Auth user created with ID: ${authId}`);

    // 3. Insert record into public.admin
    console.log('Inserting into public.admin table with role EXAM_ADMIN...');
    let adminRecord: any = null;
    const { data: inserted, error: insertErr } = await supabase
      .from('admin')
      .insert([
        {
          auth_id: authId,
          full_name: DEFAULT_EXAM_ADMIN.fullName,
          email: DEFAULT_EXAM_ADMIN.email,
          phone: DEFAULT_EXAM_ADMIN.phone,
          role: DEFAULT_EXAM_ADMIN.role,
          status: DEFAULT_EXAM_ADMIN.status,
        },
      ])
      .select()
      .single();

    adminRecord = inserted;

    if (insertErr) {
      console.error('❌ Failed to insert into public.admin as EXAM_ADMIN:', insertErr.message);
      if (insertErr.message.includes('admin_role_check')) {
        console.warn('\n⚠️ NOTE: The Postgres constraint "admin_role_check" in Supabase currently restricts role to ADMIN, SUPER_ADMIN.');
        console.warn('To make this permanent in Postgres, run the commands in migration_exam_admin.sql in Supabase SQL editor.');
        console.log('🔄 Attempting fallback insertion with role ADMIN so exam admin can authenticate immediately...');
        
        const retry = await supabase
          .from('admin')
          .insert([
            {
              auth_id: authId,
              full_name: DEFAULT_EXAM_ADMIN.fullName,
              email: DEFAULT_EXAM_ADMIN.email,
              phone: DEFAULT_EXAM_ADMIN.phone,
              role: 'ADMIN',
              status: DEFAULT_EXAM_ADMIN.status,
            },
          ])
          .select()
          .single();

        if (retry.error) {
          console.error('❌ Fallback insert also failed:', retry.error.message);
          return;
        }

        adminRecord = retry.data;
        console.log('✅ Fallback admin row created with role ADMIN (recognized by platform as EXAM_ADMIN via email/role check).');
      } else {
        return;
      }
    }

    console.log('====================================================');
    console.log('🎉 EXAM ADMIN ACCOUNT SEEDED SUCCESSFULLY!');
    console.log('====================================================');
    console.log(`   - Admin ID : ${adminRecord.admin_id}`);
    console.log(`   - Full Name: ${adminRecord.full_name}`);
    console.log(`   - Email    : ${adminRecord.email}`);
    console.log(`   - Role     : ${adminRecord.role}`);
    console.log(`   - Status   : ${adminRecord.status}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Portal URL : /admin`);
    console.log(`   Email      : ${DEFAULT_EXAM_ADMIN.email}`);
    console.log(`   Password   : ${DEFAULT_EXAM_ADMIN.password}`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Unexpected error seeding exam admin:', err.message);
  }
}

// Run seed script if executed directly
seedExamAdmin().catch(console.error);
