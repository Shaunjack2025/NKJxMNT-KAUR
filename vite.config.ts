import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function sanitizeBuildUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  if (!cleaned) return '';

  cleaned = cleaned.replace(/^(https?:\/\/)+/i, '');

  if (cleaned.startsWith('postgresql://') || cleaned.startsWith('postgres://')) {
    const match = cleaned.match(/@([^:/]+)/);
    if (match && match[1]) {
      cleaned = match[1];
    }
  }

  cleaned = cleaned.replace(/^db\./i, '');

  if (/^[a-zA-Z0-9_-]{12,30}$/.test(cleaned) && !cleaned.includes('.')) {
    cleaned = `${cleaned}.supabase.co`;
  }

  cleaned = cleaned.replace(/\/(rest|realtime)(\/v\d+)?\/?$/i, '');

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = cleaned.startsWith('localhost') || cleaned.startsWith('127.0.0.1')
      ? 'http://' + cleaned
      : 'https://' + cleaned;
  }

  return cleaned.replace(/\/+$/, '');
}

function sanitizeBuildKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  cleaned = cleaned.replace(/^Bearer\s+/i, '').trim();
  return cleaned;
}

function getBuildKeyFormat(key: string): 'sb_publishable' | 'legacy' | 'unknown' {
  if (!key) return 'unknown';
  if (key.startsWith('sb_publishable_') || key.startsWith('sbp_')) return 'sb_publishable';
  if (key.startsWith('eyJ')) return 'legacy';
  return 'unknown';
}

function getBuildProjectRef(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    if (host.endsWith('.supabase.co')) {
      return host.replace('.supabase.co', '');
    }
    return host;
  } catch {
    const match = url.match(/([a-zA-Z0-9_-]+)\.supabase\.co/);
    return match ? match[1] : '';
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const allEnvKeys = Object.keys(process.env);

  // Normalize in case of trailing spaces, lowercase, or alias differences in Vercel dashboard
  let rawUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  if (!rawUrl) {
    for (const k of allEnvKeys) {
      const normalized = k.trim().toUpperCase();
      if ((normalized === 'VITE_SUPABASE_URL' || normalized === 'SUPABASE_URL' || normalized === 'NEXT_PUBLIC_SUPABASE_URL') && process.env[k]) {
        rawUrl = process.env[k];
        break;
      }
    }
  }

  let rawKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!rawKey) {
    for (const k of allEnvKeys) {
      const normalized = k.trim().toUpperCase();
      if ((normalized === 'VITE_SUPABASE_ANON_KEY' || normalized === 'VITE_SUPABASE_PUBLISHABLE_KEY' || normalized === 'SUPABASE_ANON_KEY' || normalized === 'SUPABASE_PUBLISHABLE_KEY') && process.env[k]) {
        rawKey = process.env[k];
        break;
      }
    }
  }

  const sanitizedUrl = sanitizeBuildUrl(rawUrl);
  const sanitizedKey = sanitizeBuildKey(rawKey);

  const projectRef = getBuildProjectRef(sanitizedUrl);
  const keyFormat = getBuildKeyFormat(sanitizedKey);

  // Safe build-time diagnostics - NEVER print the actual secret key
  console.log('[NKJxMNT BUILD] ========================================');
  console.log('[NKJxMNT BUILD] Supabase URL:', sanitizedUrl ? 'FOUND' : 'MISSING');
  if (sanitizedUrl) {
    console.log('[NKJxMNT BUILD] Supabase Base URL:', sanitizedUrl);
    console.log('[NKJxMNT BUILD] Supabase Project Ref:', projectRef || 'custom');
    console.log('[NKJxMNT BUILD] REST Endpoint:', `${sanitizedUrl}/rest/v1`);
  }
  console.log('[NKJxMNT BUILD] Supabase Anon Key:', sanitizedKey ? 'FOUND' : 'MISSING');
  if (sanitizedKey) {
    console.log('[NKJxMNT BUILD] Key Format:', keyFormat);
    console.log('[NKJxMNT BUILD] Key Length:', `${sanitizedKey.length} chars`);
  }

  const detectedSupabase = allEnvKeys.filter((k) => k.toUpperCase().includes('SUPABASE'));
  if (detectedSupabase.length > 0) {
    console.log('[NKJxMNT BUILD] Detected environment keys in build container:', detectedSupabase);
  }
  console.log('[NKJxMNT BUILD] ========================================');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(sanitizedUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(sanitizedKey),
    },
  };
});
