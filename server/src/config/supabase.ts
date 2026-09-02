import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_KEY) {
  console.warn('[Supabase Config] Missing SUPABASE_URL or SUPABASE_KEY in environment variables.');
}

/**
 * Standard Supabase client for database operations.
 */
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
