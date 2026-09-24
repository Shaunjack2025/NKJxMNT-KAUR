import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Check, ShieldCheck, KeyRound, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  getKeyFormat,
  getSupabaseProjectRef,
  testSupabaseConnection,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
} from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const isConfigured = isSupabaseConfigured();
  const [url, setUrl] = useState(supabaseUrl);
  const [anonKey, setAnonKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    ok: boolean;
    latencyMs?: number;
    error?: string;
    endpoint?: string;
  }>({ tested: false, ok: false });

  const projectRef = getSupabaseProjectRef(supabaseUrl);
  const keyFormat = getKeyFormat(supabaseAnonKey);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult({ tested: false, ok: false });
    try {
      const result = await testSupabaseConnection();
      setTestResult({
        tested: true,
        ok: result.ok,
        latencyMs: result.latencyMs,
        error: result.error,
        endpoint: result.restEndpoint,
      });
    } catch (err: unknown) {
      setTestResult({
        tested: true,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) return;
    saveCustomSupabaseConfig(url, anonKey);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-[#141224] border border-white/10 p-6 text-left shadow-[0_0_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Backend & Connection Diagnostics</h3>
                <p className="text-xs text-gray-400">Supabase PostgreSQL & Realtime Engine</p>
              </div>
            </div>

            {/* Current Status banner */}
            <div
              className={`p-3 rounded-xl border mb-4 flex items-center gap-3 ${
                isConfigured
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
            >
              {isConfigured ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-white">Supabase Configured</strong>
                    Project: <span className="font-mono text-emerald-300">{projectRef || 'Custom'}</span> • Key:{' '}
                    <span className="font-mono text-emerald-300">{keyFormat}</span>
                  </div>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-white">Local Multi-Tab Demo Mode</strong>
                    Add your Supabase URL & Anon Key below for cross-device multiplayer.
                  </div>
                </>
              )}
            </div>

            {/* Diagnostics & Test Connection Section */}
            {isConfigured && (
              <div className="mb-4 p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-pink-400" />
                    REST Endpoint Health
                  </span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 border border-pink-500/30 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                    <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-mono text-gray-400 truncate">
                  <span className="text-gray-500">Target: </span>
                  {supabaseUrl ? `${supabaseUrl}/rest/v1/rooms` : '(none)'}
                </div>

                {testResult.tested && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-xs flex items-start gap-2 ${
                      testResult.ok
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
                    }`}
                  >
                    {testResult.ok ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="text-[11px] leading-relaxed break-words">
                      {testResult.ok ? (
                        <span>
                          <strong>Connected successfully!</strong> REST endpoint responded in{' '}
                          <span className="font-mono text-emerald-300">{testResult.latencyMs}ms</span>.
                        </span>
                      ) : (
                        <span>
                          <strong>Connection failed:</strong> {testResult.error || 'Network request failed'}.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Setup Instructions */}
            <div className="space-y-2 mb-4 text-xs text-gray-300">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                How to connect your Supabase project:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>
                  Create a free project at <span className="text-pink-300 font-mono">supabase.com</span>
                </li>
                <li>
                  Run the provided <span className="text-pink-300 font-mono">supabase/schema.sql</span> in SQL Editor
                </li>
                <li>Paste your Project URL & Anon public key below (or set in Vercel environment variables)</li>
              </ol>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0a14] border border-white/10 text-xs text-white font-mono outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="sb_publishable_... or eyJhbGci..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0b0a14] border border-white/10 text-xs text-white font-mono outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {saved ? <Check className="w-4 h-4" /> : null}
                  <span>{saved ? 'Saved!' : 'Save & Connect'}</span>
                </button>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
