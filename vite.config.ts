import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // Check process.env and loadEnv for VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  const allEnvKeys = Object.keys(process.env);

  // Normalize in case of trailing spaces or case differences in Vercel dashboard
  if (!process.env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL) {
    for (const k of allEnvKeys) {
      if (k.trim().toUpperCase() === 'VITE_SUPABASE_URL' && process.env[k]) {
        process.env.VITE_SUPABASE_URL = process.env[k];
        break;
      }
    }
  }

  if (!process.env.VITE_SUPABASE_ANON_KEY && !env.VITE_SUPABASE_ANON_KEY) {
    for (const k of allEnvKeys) {
      if (k.trim().toUpperCase() === 'VITE_SUPABASE_ANON_KEY' && process.env[k]) {
        process.env.VITE_SUPABASE_ANON_KEY = process.env[k];
        break;
      }
    }
  }

  const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  // Safe build-time diagnostics - NEVER print the actual key
  console.log('[NKJxMNT BUILD] VITE_SUPABASE_URL:', url ? 'FOUND' : 'MISSING');
  console.log('[NKJxMNT BUILD] VITE_SUPABASE_ANON_KEY:', key ? 'FOUND' : 'MISSING');

  const detectedSupabase = allEnvKeys.filter((k) => k.toUpperCase().includes('SUPABASE'));
  if (detectedSupabase.length > 0) {
    console.log('[NKJxMNT BUILD] Detected environment keys in build container:', detectedSupabase);
  }

  return {
    plugins: [react()],
  };
});
