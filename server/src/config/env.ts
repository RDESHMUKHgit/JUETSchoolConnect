import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://cedklyodapmquxlancvg.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'sb_publishable_p4Ekx-sCQ7-DB0iuFsT0gg_eN94x42x',
  JWT_SECRET: process.env.JWT_SECRET || 'jaypee_school_connect_super_jwt_secret_key_2026_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'jaypee_session_token',
};
