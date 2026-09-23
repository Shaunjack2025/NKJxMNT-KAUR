import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from environment variables or custom runtime storage
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// In-browser override support for easy deployment / testing
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('nkj_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('nkj_supabase_key') || '' : '';

export const supabaseUrl = storedUrl || envUrl;
export const supabaseAnonKey = storedKey || envKey;

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
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
  }
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
