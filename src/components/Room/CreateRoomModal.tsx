import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      setError(null);
      await onCreate(name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm rounded-3xl bg-[#141224] border border-pink-500/40 p-6 text-center shadow-[0_0_50px_rgba(236,72,153,0.3)] relative overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.6)]">
                <Heart className="w-7 h-7 fill-white" />
              </div>
            </div>

            <h3 className="text-xl font-black text-white">Create New Game</h3>
            <p className="text-xs text-gray-400 mt-1">
              Enter your name to start the room as Player 1
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NKJ"
                  maxLength={16}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#0b0a14] border border-white/10 focus:border-pink-500 text-white placeholder-gray-500 text-sm font-semibold outline-none transition-all shadow-inner"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] border border-pink-300/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Creating Room...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>CREATE ROOM 🎲</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
