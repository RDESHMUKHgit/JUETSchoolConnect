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

const DEFAULT_ADMIN = {
  fullName: 'Jaypee Platform Administrator',
  email: process.env.ADMIN_EMAIL || 'admin@jaypee.ac.in',
  password: process.env.ADMIN_PASSWORD || 'Admin@Jaypee2026!',
  phone: '+91 99999 99999',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
};

export async function seedAdmin(): Promise<void> {
  console.log('====================================================');
  console.log('🌱 JAYPEE SCHOOL CONNECT — ADMIN SEED SCRIPT');
  console.log('====================================================');
  console.log(`Checking existing platform admin for: ${DEFAULT_ADMIN.email}...`);

  try {
    // 1. Check if admin record already exists in public.admin
    const { data: existingAdmin, error: checkErr } = await supabase
      .from('admin')
      .select('*')
      .eq('email', DEFAULT_ADMIN.email)
      .maybeSingle();

    if (checkErr) {
      console.error('❌ Error checking public.admin table:', checkErr.message);
      return;
    }

    if (existingAdmin) {
      console.log('✅ Admin record already exists in database:');
      console.log(`   - Admin ID : ${existingAdmin.admin_id}`);
      console.log(`   - Auth ID  : ${existingAdmin.auth_id}`);
      console.log(`   - Email    : ${existingAdmin.email}`);
      console.log(`   - Role     : ${existingAdmin.role}`);
      console.log(`   - Status   : ${existingAdmin.status}`);
      console.log('\n🔑 Login Credentials:');
      console.log(`   URL      : /admin`);
      console.log(`   Email    : ${DEFAULT_ADMIN.email}`);
      console.log(`   Password : ${DEFAULT_ADMIN.password}`);
      console.log('====================================================');
      return;
    }

    // 2. Register account in Supabase Auth
    console.log('Creating auth account in Supabase...');
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
      options: {
        data: {
          full_name: DEFAULT_ADMIN.fullName,
          role: 'ADMIN',
        },
      },
    });

    if (authErr && !authData?.user) {
      console.error('❌ Failed to create Supabase Auth user:', authErr.message);
      return;
    }

    const authId = authData?.user?.id;
    if (!authId) {
      console.error('❌ User ID could not be retrieved from auth signup.');
      return;
    }

    console.log(`✅ Auth user created with ID: ${authId}`);

    // 3. Insert record into public.admin
    console.log('Inserting into public.admin table...');
    const { data: adminRecord, error: insertErr } = await supabase
      .from('admin')
      .insert([
        {
          auth_id: authId,
          full_name: DEFAULT_ADMIN.fullName,
          email: DEFAULT_ADMIN.email,
          phone: DEFAULT_ADMIN.phone,
          role: DEFAULT_ADMIN.role,
          status: DEFAULT_ADMIN.status,
        },
      ])
      .select()
      .single();

    if (insertErr) {
      console.error('❌ Failed to insert into public.admin:', insertErr.message);
      return;
    }

    console.log('====================================================');
    console.log('🎉 PLATFORM ADMIN ACCOUNT SEEDED SUCCESSFULLY!');
    console.log('====================================================');
    console.log(`   - Admin ID : ${adminRecord.admin_id}`);
    console.log(`   - Full Name: ${adminRecord.full_name}`);
    console.log(`   - Email    : ${adminRecord.email}`);
    console.log(`   - Role     : ${adminRecord.role}`);
    console.log(`   - Status   : ${adminRecord.status}`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Portal URL : /admin`);
    console.log(`   Email      : ${DEFAULT_ADMIN.email}`);
    console.log(`   Password   : ${DEFAULT_ADMIN.password}`);
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Unexpected error seeding admin:', err.message);
  }
}

// Run seed script
seedAdmin().catch(console.error);
