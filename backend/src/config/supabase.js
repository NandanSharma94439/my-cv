/**
 * supabase.js
 * -----------
 * Supabase client singleton using the SERVICE ROLE KEY.
 *
 * IMPORTANT: The service role key bypasses Row Level Security.
 * It must NEVER be exposed to the browser or committed to Git.
 * It lives ONLY in this server-side module.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n' +
    '    Please set them in Vercel Dashboard -> Settings -> Environment Variables.'
  );
}

const supabase = createClient(url, key, {
  auth: {
    // Disable auto-refresh and session persistence — this is a
    // server-side client, not a browser client.
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export default supabase;
