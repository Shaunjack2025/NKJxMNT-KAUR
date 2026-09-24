import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  type Database,
  ref,
  get,
  onValue,
  off,
  set,
  update,
  remove,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';

export {
  ref,
  get,
  onValue,
  off,
  set,
  update,
  remove,
  onDisconnect,
  serverTimestamp,
};

/**
 * Robust string sanitization helper
 * Strips zero-width chars, surrounding quotes, and whitespace
 */
export function sanitizeString(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  return cleaned;
}

/**
 * Robust URL sanitization helper for Firebase Realtime Database
 */
export function sanitizeUrl(raw: unknown): string {
  let cleaned = sanitizeString(raw);
  if (!cleaned) return '';

  cleaned = cleaned.replace(/^(https?:\/\/)+/i, '');

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }

  return cleaned.replace(/\/+$/, '');
}

// Retrieve from Vite build-time environment variables
const envApiKey = sanitizeString(import.meta.env.VITE_FIREBASE_API_KEY);
const envAuthDomain = sanitizeString(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
const envDatabaseUrl = sanitizeUrl(
  import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://nkjxmnt-kaur-6aef9-default-rtdb.firebaseio.com'
);
const envProjectId = sanitizeString(
  import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nkjxmnt-kaur-6aef9'
);
const envStorageBucket = sanitizeString(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
const envMessagingSenderId = sanitizeString(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
const envAppId = sanitizeString(import.meta.env.VITE_FIREBASE_APP_ID);
const envMeasurementId = sanitizeString(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

// Optional in-browser overrides for quick testing / manual config
const storedApiKey = typeof window !== 'undefined' ? sanitizeString(localStorage.getItem('nkj_firebase_api_key')) : '';
const storedDatabaseUrl = typeof window !== 'undefined' ? sanitizeUrl(localStorage.getItem('nkj_firebase_database_url')) : '';
const storedProjectId = typeof window !== 'undefined' ? sanitizeString(localStorage.getItem('nkj_firebase_project_id')) : '';

export const firebaseApiKey = envApiKey || storedApiKey;
export const firebaseDatabaseUrl = envDatabaseUrl || storedDatabaseUrl || 'https://nkjxmnt-kaur-6aef9-default-rtdb.firebaseio.com';
export const firebaseProjectId = envProjectId || storedProjectId || 'nkjxmnt-kaur-6aef9';
export const firebaseAuthDomain = envAuthDomain || (firebaseProjectId ? `${firebaseProjectId}.firebaseapp.com` : '');
export const firebaseStorageBucket = envStorageBucket || (firebaseProjectId ? `${firebaseProjectId}.appspot.com` : '');
export const firebaseMessagingSenderId = envMessagingSenderId;
export const firebaseAppId = envAppId;
export const firebaseMeasurementId = envMeasurementId;

/**
 * Check if Firebase has the required configuration to initialize Realtime Database
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseApiKey && firebaseDatabaseUrl && firebaseProjectId);
}

/**
 * Safe key preview (only first 6 chars, never secrets)
 */
export function getSafeKeyPreview(key: string): string {
  if (!key) return 'none';
  if (key.length <= 8) return '***';
  return `${key.slice(0, 6)}... (${key.length} chars)`;
}

export let firebaseApp: FirebaseApp | null = null;
export let firebaseDb: Database | null = null;
export let firebaseInitError: string | null = null;

/**
 * Get or initialize Firebase App
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) return firebaseApp;

  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = getApp();
      return firebaseApp;
    }

    const firebaseConfig = {
      apiKey: firebaseApiKey,
      authDomain: firebaseAuthDomain,
      databaseURL: firebaseDatabaseUrl,
      projectId: firebaseProjectId,
      storageBucket: firebaseStorageBucket,
      messagingSenderId: firebaseMessagingSenderId,
      appId: firebaseAppId,
      measurementId: firebaseMeasurementId,
    };

    firebaseApp = initializeApp(firebaseConfig);
    firebaseInitError = null;
    return firebaseApp;
  } catch (err: unknown) {
    firebaseInitError = err instanceof Error ? err.message : String(err);
    console.error('[NKJxMNT] Error initializing Firebase App:', err);
    return null;
  }
}

/**
 * Get or initialize Firebase Realtime Database
 */
export function getFirebaseDatabase(): Database | null {
  if (firebaseDb) return firebaseDb;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    firebaseDb = getDatabase(app, firebaseDatabaseUrl);
    return firebaseDb;
  } catch (err: unknown) {
    firebaseInitError = err instanceof Error ? err.message : String(err);
    console.error('[NKJxMNT] Error initializing Firebase Realtime Database:', err);
    return null;
  }
}

/**
 * Safe diagnostics logger
 */
export function logFirebaseDiagnostics(): void {
  console.log('[NKJxMNT] ========================================');
  console.log('[NKJxMNT] Firebase Realtime Database Configuration:');
  console.log('[NKJxMNT] Project ID:', firebaseProjectId || '(none)');
  console.log('[NKJxMNT] Database URL:', firebaseDatabaseUrl || '(none)');
  console.log('[NKJxMNT] API Key Status:', firebaseApiKey ? 'FOUND' : 'MISSING');
  console.log('[NKJxMNT] API Key Preview:', getSafeKeyPreview(firebaseApiKey));
  console.log('[NKJxMNT] App ID Status:', firebaseAppId ? 'FOUND' : 'OPTIONAL/MISSING');
  console.log('[NKJxMNT] Valid Config:', isFirebaseConfigured());
  console.log('[NKJxMNT] ========================================');
}

// Log diagnostics on module load
logFirebaseDiagnostics();

// Pre-initialize if configuration is valid
if (isFirebaseConfigured()) {
  getFirebaseDatabase();
}

/**
 * Test Firebase Realtime Database connection & roundtrip latency
 */
export async function testFirebaseConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
  databaseUrl: string;
  projectId: string;
}> {
  if (!isFirebaseConfigured()) {
    return {
      ok: false,
      latencyMs: 0,
      error: 'Firebase API Key or Database URL is not configured',
      databaseUrl: firebaseDatabaseUrl,
      projectId: firebaseProjectId,
    };
  }

  const db = getFirebaseDatabase();
  if (!db) {
    return {
      ok: false,
      latencyMs: 0,
      error: `Failed to initialize Firebase client: ${firebaseInitError || 'Unknown error'}`,
      databaseUrl: firebaseDatabaseUrl,
      projectId: firebaseProjectId,
    };
  }

  const startTime = Date.now();
  try {
    // Listen to Firebase's built-in .info/connected ref
    const connectedRef = ref(db, '.info/connected');
    const isConnected = await new Promise<boolean>((resolve) => {
      const unsubscribe = onValue(
        connectedRef,
        (snap) => {
          unsubscribe();
          resolve(Boolean(snap.val()));
        },
        () => {
          resolve(false);
        }
      );

      // Fallback timeout after 3.5s
      setTimeout(() => {
        try {
          unsubscribe();
        } catch {
          // Ignore
        }
        resolve(false);
      }, 3500);
    });

    const latencyMs = Date.now() - startTime;
    return {
      ok: isConnected,
      latencyMs,
      error: isConnected ? undefined : 'Connection timed out or waiting for handshake',
      databaseUrl: firebaseDatabaseUrl,
      projectId: firebaseProjectId,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    return {
      ok: false,
      latencyMs,
      error: err instanceof Error ? err.message : String(err),
      databaseUrl: firebaseDatabaseUrl,
      projectId: firebaseProjectId,
    };
  }
}

export function saveCustomFirebaseConfig(apiKey: string, databaseUrl?: string, projectId?: string): boolean {
  if (!apiKey) return false;
  localStorage.setItem('nkj_firebase_api_key', sanitizeString(apiKey));
  if (databaseUrl) localStorage.setItem('nkj_firebase_database_url', sanitizeUrl(databaseUrl));
  if (projectId) localStorage.setItem('nkj_firebase_project_id', sanitizeString(projectId));
  window.location.reload();
  return true;
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem('nkj_firebase_api_key');
  localStorage.removeItem('nkj_firebase_database_url');
  localStorage.removeItem('nkj_firebase_project_id');
  window.location.reload();
}
