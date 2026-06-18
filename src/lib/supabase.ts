import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './types.js';

// Serverless-safe options: disabling auth session management prevents @supabase/auth-js
// from starting a setInterval auto-refresh ticker that leaks across Lambda invocations.
export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
