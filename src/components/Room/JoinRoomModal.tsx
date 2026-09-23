import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, UserPlus } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string, name: string) => Promise<void>;
  initialRoomCode?: string;
  creatorName?: string;
  isLoading: boolean;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialRoomCode = '',
  creatorName,
  isLoading,
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Keep roomCode in sync if prop changes
  React.useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter the 6-character room code');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      setError(null);
      await onJoin(roomCode.trim().toUpperCase(), name.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
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
            className="w-full max-w-sm rounded-3xl bg-[#141224] border border-cyan-500/40 p-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                <UserPlus className="w-7 h-7" />
              </div>
            </div>

            <h3 className="text-xl font-black text-white">Join Game</h3>

            {creatorName ? (
              <p className="text-xs text-cyan-200/90 mt-1 font-medium bg-cyan-950/60 py-1 px-3 rounded-full inline-block border border-cyan-500/30">
                ✨ <strong className="text-white">{creatorName}</strong> has invited you to play!
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Enter your invite code and name to join
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {!initialRoomCode && (
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 6-CHAR CODE"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0a14] border border-white/10 focus:border-cyan-500 text-white placeholder-gray-500 text-sm font-mono font-bold tracking-widest uppercase outline-none transition-all shadow-inner"
                  />
                </div>
              )}

              <div className="text-left">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MNT"
                  maxLength={16}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#0b0a14] border border-white/10 focus:border-cyan-500 text-white placeholder-gray-500 text-sm font-semibold outline-none transition-all shadow-inner"
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
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Joining Game...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>JOIN GAME 🎲</span>
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
