import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper to sanitize URL (strips quotes, ensures https://, strips trailing slashes)
function sanitizeUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  // Strip leading/trailing single or double quotes
  cleaned = cleaned.replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return '';
  // Ensure http:// or https:// protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  // Strip trailing slashes
  return cleaned.replace(/\/+$/, '');
}

// Helper to sanitize Key (strips quotes, trims whitespace)
function sanitizeKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.trim();
  // Strip leading/trailing single or double quotes
  cleaned = cleaned.replace(/^["']+|["']+$/g, '').trim();
  return cleaned;
}

// Retrieve from Vite build-time environment variables
const envUrl = sanitizeUrl(import.meta.env.VITE_SUPABASE_URL);
const envKey = sanitizeKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

// In-browser override support for local testing
const storedUrl = typeof window !== 'undefined' ? sanitizeUrl(localStorage.getItem('nkj_supabase_url')) : '';
const storedKey = typeof window !== 'undefined' ? sanitizeKey(localStorage.getItem('nkj_supabase_key')) : '';

// Prefer environment variables over localStorage in production
export const supabaseUrl = envUrl || storedUrl;
export const supabaseAnonKey = envKey || storedKey;

// Identify key format safely without exposing secrets
export const getKeyFormat = (key: string): 'sb_publishable' | 'legacy' | 'unknown' => {
  if (!key) return 'unknown';
  if (key.startsWith('sb_publishable_') || key.startsWith('sbp_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) return 'legacy';
  return 'unknown';
};

// Check if configuration is present and valid
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  const hasValidProtocol = supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://');
  // Supports new Supabase publishable keys (sb_publishable_...), legacy JWTs (eyJ...), or any valid key
  const hasValidKey = supabaseAnonKey.length >= 10;
  return Boolean(hasValidProtocol && hasValidKey);
};

// Safe diagnostics logger that NEVER prints actual keys
export const logSupabaseDiagnostics = (): void => {
  const urlStatus = supabaseUrl ? 'FOUND' : 'MISSING';
  const keyStatus = supabaseAnonKey ? 'FOUND' : 'MISSING';
  const format = getKeyFormat(supabaseAnonKey);

  console.log('[NKJxMNT] Supabase configuration:');
  console.log('URL:', urlStatus, supabaseUrl ? `(${supabaseUrl})` : '');
  console.log('Publishable key:', keyStatus);
  console.log('Key format:', format);
};

export let supabase: SupabaseClient | null = null;
export let supabaseInitError: string | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  if (isSupabaseConfigured()) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 15,
          },
        },
      });
      supabaseInitError = null;
      return supabase;
    } catch (err) {
      supabaseInitError = err instanceof Error ? err.message : String(err);
      console.error('[NKJxMNT] Error initializing Supabase client:', err);
      return null;
    }
  }
  return null;
}

// Log diagnostics on startup
logSupabaseDiagnostics();

// Initialize client if configured
if (isSupabaseConfigured()) {
  getSupabase();
}

export function saveCustomSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  localStorage.setItem('nkj_supabase_url', sanitizeUrl(url));
  localStorage.setItem('nkj_supabase_key', sanitizeKey(key));
  window.location.reload();
  return true;
}

export function clearCustomSupabaseConfig(): void {
  localStorage.removeItem('nkj_supabase_url');
  localStorage.removeItem('nkj_supabase_key');
  window.location.reload();
}
