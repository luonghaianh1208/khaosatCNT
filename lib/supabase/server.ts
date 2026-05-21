import { createClient } from '@supabase/supabase-js';

function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a client with placeholder values during build
    // In production, these should be set via environment variables
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceKey || 'placeholder-key',
      { auth: { persistSession: false } }
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export const supabaseAdmin = createSupabaseAdmin();