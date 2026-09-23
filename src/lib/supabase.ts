import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from Vite build-time environment variables or custom runtime storage
const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawEnvKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const envUrl = typeof rawEnvUrl === 'string' ? rawEnvUrl.trim() : '';
const envKey = typeof rawEnvKey === 'string' ? rawEnvKey.trim() : '';

// In-browser override support for easy deployment testing on mobile or staging
const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem('nkj_supabase_url') || '').trim() : '';
const storedKey = typeof window !== 'undefined' ? (localStorage.getItem('nkj_supabase_key') || '').trim() : '';

export const supabaseUrl = envUrl || storedUrl;
export const supabaseAnonKey = envKey || storedKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
      },
    });
    console.log('[NKJxMNT] Supabase Client Initialized successfully for URL:', supabaseUrl);
  } catch (err) {
    console.error('[NKJxMNT] Error initializing Supabase client:', err);
  }
} else {
  console.warn(
    '[NKJxMNT] Supabase credentials not found or incomplete. VITE_SUPABASE_URL:',
    envUrl ? 'FOUND (' + envUrl + ')' : 'MISSING',
    '| VITE_SUPABASE_ANON_KEY:',
    envKey ? 'FOUND' : 'MISSING'
  );
}

export function saveCustomSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  localStorage.setItem('nkj_supabase_url', url.trim());
  localStorage.setItem('nkj_supabase_key', key.trim());
  window.location.reload();
  return true;
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem('nkj_supabase_url');
  localStorage.removeItem('nkj_supabase_key');
  window.location.reload();
}
