import {createClient} from '@supabase/supabase-js';

const env = import.meta.env as Record<string, unknown>;

const supabaseUrl =
  typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL : undefined;
const supabaseKey =
  (typeof env.VITE_SUPABASE_ANON_KEY === 'string' &&
    env.VITE_SUPABASE_ANON_KEY) ||
  (typeof env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY === 'string' &&
    env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) ||
  undefined;

if (!supabaseUrl) {
  throw new Error(
    'Missing environment variable VITE_SUPABASE_URL. Add it to your .env and restart the dev server.',
  );
}

if (!supabaseKey) {
  throw new Error(
    'Missing Supabase publishable key. Set VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY in your .env and restart the dev server.',
  );
}

const supabase = createClient(String(supabaseUrl), String(supabaseKey));

export default supabase;
