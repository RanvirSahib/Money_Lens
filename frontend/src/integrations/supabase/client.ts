// Money Lens uses custom FastAPI + PostgreSQL RDS backend.
// This mock client ensures zero console errors when unused Supabase hooks/types are loaded.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] || 'https://moneylens-db.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || 'sb_publishable_moneylens_local_dummy_key';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
