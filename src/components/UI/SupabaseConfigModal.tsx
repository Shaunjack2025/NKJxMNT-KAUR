import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, Check, ShieldCheck, KeyRound } from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, saveCustomSupabaseConfig, clearCustomSupabaseConfig } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const isConfigured = isSupabaseConfigured();
  const [url, setUrl] = useState(supabaseUrl);
  const [anonKey, setAnonKey] = useState('');
  const [saved, setSaved] = useState(false);

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
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Multiplayer Backend</h3>
                <p className="text-xs text-gray-400">Supabase PostgreSQL & Realtime Engine</p>
              </div>
            </div>

            {/* Current Status banner */}
            <div className={`p-3 rounded-xl border mb-5 flex items-center gap-3 ${
              isConfigured 
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
                : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            }`}>
              {isConfigured ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <strong className="block text-white">Connected to Supabase Realtime</strong>
                    Multi-device cross-network synchronization is active.
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

            {/* Quick Setup Instructions */}
            <div className="space-y-2 mb-5 text-xs text-gray-300">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">
                How to connect your Supabase project:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Create a free project at <span className="text-pink-300 font-mono">supabase.com</span></li>
                <li>Run the provided <span className="text-pink-300 font-mono">supabase/schema.sql</span> in SQL Editor</li>
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
