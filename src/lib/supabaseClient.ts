import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && (SERVICE_ROLE_KEY || ANON_KEY));

if (!SUPABASE_URL) {
  console.warn('Supabase URL is not configured. Falling back to mocked data in development.');
}
if (!SERVICE_ROLE_KEY && !ANON_KEY) {
  console.warn('Supabase key missing – some features will not work until you set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
}

const client = isSupabaseConfigured
  ? createClient(SUPABASE_URL || '', SERVICE_ROLE_KEY || ANON_KEY || '')
  : null;

export const supabaseClient = client;

export function ensureSupabase() {
  if (!client) {
    throw new Error('Supabase client is not configured. Provide SUPABASE_URL and a key.');
  }
  return client;
}
