import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function sanitizeBuildString(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  return cleaned;
}

function sanitizeBuildUrl(raw: unknown): string {
  let cleaned = sanitizeBuildString(raw);
  if (!cleaned) return '';

  cleaned = cleaned.replace(/^(https?:\/\/)+/i, '');

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  return cleaned.replace(/\/+$/, '');
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const allEnvKeys = Object.keys(process.env);

  const getEnv = (keyName: string): string => {
    if (process.env[keyName]) return process.env[keyName]!;
    if (env[keyName]) return env[keyName];

    // Case-insensitive lookup for convenience in deployment environments
    const upper = keyName.toUpperCase();
    for (const k of allEnvKeys) {
      if (k.toUpperCase() === upper && process.env[k]) {
        return process.env[k]!;
      }
    }
    return '';
  };

  const apiKey = sanitizeBuildString(getEnv('VITE_FIREBASE_API_KEY') || getEnv('FIREBASE_API_KEY'));
  const databaseUrl = sanitizeBuildUrl(
    getEnv('VITE_FIREBASE_DATABASE_URL') ||
      getEnv('FIREBASE_DATABASE_URL') ||
      'https://nkjxmnt-kaur-6aef9-default-rtdb.firebaseio.com'
  );
  const projectId = sanitizeBuildString(
    getEnv('VITE_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID') || 'nkjxmnt-kaur-6aef9'
  );
  const authDomain = sanitizeBuildString(
    getEnv('VITE_FIREBASE_AUTH_DOMAIN') || (projectId ? `${projectId}.firebaseapp.com` : '')
  );
  const storageBucket = sanitizeBuildString(
    getEnv('VITE_FIREBASE_STORAGE_BUCKET') || (projectId ? `${projectId}.appspot.com` : '')
  );
  const messagingSenderId = sanitizeBuildString(
    getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnv('FIREBASE_MESSAGING_SENDER_ID')
  );
  const appId = sanitizeBuildString(getEnv('VITE_FIREBASE_APP_ID') || getEnv('FIREBASE_APP_ID'));
  const measurementId = sanitizeBuildString(
    getEnv('VITE_FIREBASE_MEASUREMENT_ID') || getEnv('FIREBASE_MEASUREMENT_ID')
  );

  // Safe build-time diagnostics - NEVER print the secret API key
  console.log('[NKJxMNT BUILD] ========================================');
  console.log('[NKJxMNT BUILD] Backend: Firebase Realtime Database');
  console.log('[NKJxMNT BUILD] Firebase Project ID:', projectId || 'MISSING');
  console.log('[NKJxMNT BUILD] Firebase Database URL:', databaseUrl || 'MISSING');
  console.log('[NKJxMNT BUILD] Firebase API Key:', apiKey ? 'FOUND' : 'MISSING (Will be read from env in production/runtime)');
  if (appId) {
    console.log('[NKJxMNT BUILD] Firebase App ID: FOUND');
  }
  const detectedFirebase = allEnvKeys.filter((k) => k.toUpperCase().includes('FIREBASE'));
  if (detectedFirebase.length > 0) {
    console.log('[NKJxMNT BUILD] Detected Firebase keys in environment:', detectedFirebase);
  }
  console.log('[NKJxMNT BUILD] ========================================');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(databaseUrl),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(authDomain),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(storageBucket),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(messagingSenderId),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(appId),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(measurementId),
    },
  };
});
