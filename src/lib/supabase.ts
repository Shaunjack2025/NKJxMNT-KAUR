import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Robust URL sanitization helper
 * Handles:
 * - Leading/trailing/zero-width spaces (\u200B-\u200D, \uFEFF, \u00A0)
 * - Quotes ("...", '...', `...`), angle brackets (<...>)
 * - Accidental duplicate protocols (https://https://)
 * - Strips PostgreSQL connection URIs if accidentally pasted (postgresql://... -> hostname)
 * - Strips db. prefix if user copied db host (db.projectref.supabase.co -> projectref.supabase.co)
 * - Auto-expands bare project reference tokens (e.g. "pdrhsgqkwotoxxx" -> "pdrhsgqkwotoxxx.supabase.co")
 * - Strips trailing paths like /rest/v1, /rest, /realtime/v1
 * - Ensures https:// protocol
 * - Strips trailing slashes
 */
export function sanitizeUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // 1. Remove zero-width spaces, BOM, non-breaking spaces, newlines, carriage returns, tabs
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();

  // 2. Remove surrounding quotes, backticks, angle brackets <...>, and spaces
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  if (!cleaned) return '';

  // 3. Remove accidental duplicate protocols like https://https:// or http://https://
  cleaned = cleaned.replace(/^(https?:\/\/)+/i, '');

  // 4. Strip postgresql:// or postgres:// if user copied db connection string
  if (cleaned.startsWith('postgresql://') || cleaned.startsWith('postgres://')) {
    const match = cleaned.match(/@([^:/]+)/);
    if (match && match[1]) {
      cleaned = match[1];
    }
  }

  // 5. If hostname starts with db. (e.g. db.projectref.supabase.co), strip db. prefix
  cleaned = cleaned.replace(/^db\./i, '');

  // 6. If user pasted only the project ref (e.g. 12-30 alphanumeric chars without dots)
  if (/^[a-zA-Z0-9_-]{12,30}$/.test(cleaned) && !cleaned.includes('.')) {
    cleaned = `${cleaned}.supabase.co`;
  }

  // 7. Remove any trailing paths like /rest/v1, /rest, /realtime/v1, etc.
  cleaned = cleaned.replace(/\/(rest|realtime)(\/v\d+)?\/?$/i, '');

  // 8. Ensure https:// protocol (unless localhost / 127.0.0.1)
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = cleaned.startsWith('localhost') || cleaned.startsWith('127.0.0.1')
      ? 'http://' + cleaned
      : 'https://' + cleaned;
  }

  // 9. Strip any trailing slashes
  return cleaned.replace(/\/+$/, '');
}

/**
 * Robust Key sanitization helper
 * Strips zero-width chars, quotes, angle brackets, and accidental "Bearer " prefix
 */
export function sanitizeKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  let cleaned = raw.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();
  cleaned = cleaned.replace(/^[<"'\s`]+|[>"'\s`]+$/g, '').trim();
  // Strip accidental "Bearer " prefix if copied from an Authorization header
  cleaned = cleaned.replace(/^Bearer\s+/i, '').trim();
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

// Safely extract Supabase project reference from URL
export const getSupabaseProjectRef = (url: string): string => {
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
};

// Safe key preview (only the first 6 characters, never the secret body)
export const getSafeKeyPreview = (key: string): string => {
  if (!key) return 'none';
  if (key.length <= 8) return '***';
  return `${key.slice(0, 6)}... (${key.length} chars)`;
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
  const projectRef = getSupabaseProjectRef(supabaseUrl);
  const keyPreview = getSafeKeyPreview(supabaseAnonKey);

  console.log('[NKJxMNT] ========================================');
  console.log('[NKJxMNT] Supabase Client Configuration:');
  console.log('[NKJxMNT] URL Status:', urlStatus);
  console.log('[NKJxMNT] Supabase Base URL:', supabaseUrl || '(none)');
  console.log('[NKJxMNT] Supabase Project Ref:', projectRef || '(none)');
  console.log('[NKJxMNT] REST API Endpoint:', supabaseUrl ? `${supabaseUrl}/rest/v1` : '(none)');
  console.log('[NKJxMNT] Publishable Key Status:', keyStatus);
  console.log('[NKJxMNT] Key Format:', format);
  console.log('[NKJxMNT] Key Preview:', keyPreview);
  console.log('[NKJxMNT] Valid Config:', isSupabaseConfigured());
  console.log('[NKJxMNT] ========================================');
};

/**
 * Diagnostic Fetch wrapper:
 * Logs all outgoing Supabase network requests safely, captures native fetch exceptions,
 * and runs a connectivity probe when a network error occurs.
 */
export const diagnosticFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || (typeof input === 'object' && input && 'method' in input ? (input as Request).method : 'GET');

  console.log(`[NKJxMNT NETWORK] -> ${method} ${url}`);
  const startTime = Date.now();

  try {
    const response = await fetch(input, init);
    const duration = Date.now() - startTime;
    console.log(`[NKJxMNT NETWORK] <- ${method} ${url} [Status: ${response.status} ${response.statusText}] (${duration}ms)`);
    return response;
  } catch (err: unknown) {
    const duration = Date.now() - startTime;
    const isTypeError = err instanceof TypeError;
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    console.error(`[NKJxMNT NETWORK] FETCH FAILURE (${duration}ms):`, {
      method,
      url,
      isTypeError,
      message,
      stack,
      browserOnline: isOnline,
    });

    // Run background probe to isolate DNS vs CORS vs offline
    probeNetworkFailure(url);

    throw err;
  }
};

/**
 * Probe helper to determine if a fetch error is due to:
 * - Browser offline
 * - Host DNS resolution failure
 * - CORS / Preflight failure
 */
async function probeNetworkFailure(targetUrl: string): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('[NKJxMNT DIAGNOSTICS] Device appears to be OFFLINE (navigator.onLine is false).');
      return;
    }

    const parsed = new URL(targetUrl);
    const hostOrigin = parsed.origin;

    // Test a lightweight no-cors GET to the host root/favicon
    // If no-cors fetch fails, host is completely unresolvable (DNS or connection refused)
    // If no-cors fetch succeeds, host is reachable, meaning REST failure was a CORS / 404 / HTTP error
    const probeStart = Date.now();
    try {
      await fetch(`${hostOrigin}/favicon.ico`, { mode: 'no-cors' });
      const probeDuration = Date.now() - probeStart;
      console.warn(`[NKJxMNT DIAGNOSTICS] Host "${hostOrigin}" IS REACHABLE (${probeDuration}ms via no-cors). ` +
        `The REST failure on "${targetUrl}" is likely caused by CORS policy rejection, wrong API endpoint path, or blocked headers.`);
    } catch (probeErr) {
      console.error(`[NKJxMNT DIAGNOSTICS] Host "${hostOrigin}" is UNREACHABLE via no-cors probe:`, probeErr);
      console.error(`[NKJxMNT DIAGNOSTICS] Possible root causes: DNS failure for "${parsed.hostname}", invalid project ref, ad-blocker / firewall blocking supabase.co, or paused Supabase project.`);
    }
  } catch {
    // Ignore probe errors
  }
}

export let supabase: SupabaseClient | null = null;
export let supabaseInitError: string | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  if (isSupabaseConfigured()) {
    try {
      console.log(`[NKJxMNT] Initializing Supabase client with URL: ${supabaseUrl}`);
      supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: diagnosticFetch,
        },
        realtime: {
          params: {
            eventsPerSecond: 15,
          },
          logger: (kind: string, msg: string, data?: unknown) => {
            console.log(`[NKJxMNT REALTIME] [${kind}] ${msg}`, data || '');
          },
          heartbeatCallback: (status: string, latency?: number) => {
            if (status === 'ok') {
              console.log(`[NKJxMNT REALTIME] Heartbeat OK (${latency}ms)`);
            } else {
              console.warn(`[NKJxMNT REALTIME] Heartbeat status: ${status}`, latency ? `(${latency}ms)` : '');
            }
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

// Log diagnostics on module load
logSupabaseDiagnostics();

// Initialize client if configured
if (isSupabaseConfigured()) {
  getSupabase();
}

/**
 * Test Supabase REST endpoint without exposing the API key
 */
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  restOk: boolean;
  latencyMs: number;
  httpStatus?: number;
  error?: string;
  restEndpoint: string;
  projectRef: string;
}> {
  const restEndpoint = supabaseUrl ? `${supabaseUrl}/rest/v1/rooms?select=id&limit=1` : '';
  const projectRef = getSupabaseProjectRef(supabaseUrl);

  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      restOk: false,
      latencyMs: 0,
      error: 'Supabase URL or Key is not configured',
      restEndpoint,
      projectRef,
    };
  }

  const client = getSupabase() || supabase;
  if (!client) {
    return {
      ok: false,
      restOk: false,
      latencyMs: 0,
      error: `Failed to initialize client: ${supabaseInitError || 'Unknown error'}`,
      restEndpoint,
      projectRef,
    };
  }

  const startTime = Date.now();
  try {
    console.log(`[NKJxMNT DIAGNOSTICS] Testing REST endpoint: ${restEndpoint}`);
    const { data: _data, error } = await client.from('rooms').select('id').limit(1);
    const latencyMs = Date.now() - startTime;

    if (error) {
      // If error has a Postgres code (e.g. 42P01 table does not exist, 42501 RLS restriction),
      // the REST server DID answer over HTTP!
      if (error.code) {
        console.log(`[NKJxMNT DIAGNOSTICS] REST API responded in ${latencyMs}ms with Postgres code: ${error.code}`);
        return {
          ok: true,
          restOk: true,
          latencyMs,
          error: error.message,
          restEndpoint,
          projectRef,
        };
      }

      console.warn('[NKJxMNT DIAGNOSTICS] REST API test failed:', error);
      return {
        ok: false,
        restOk: false,
        latencyMs,
        error: error.message,
        restEndpoint,
        projectRef,
      };
    }

    console.log(`[NKJxMNT DIAGNOSTICS] Supabase REST connection test PASSED (${latencyMs}ms)`);
    return {
      ok: true,
      restOk: true,
      latencyMs,
      restEndpoint,
      projectRef,
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[NKJxMNT DIAGNOSTICS] Supabase connection test native failure (${latencyMs}ms):`, err);
    return {
      ok: false,
      restOk: false,
      latencyMs,
      error: msg,
      restEndpoint,
      projectRef,
    };
  }
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
