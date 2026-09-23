import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Dices, UserPlus, Heart } from 'lucide-react';

interface LandingViewProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onCreateClick, onJoinClick }) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[75vh] px-4 text-center select-none">
      {/* Decorative center icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-pink-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] border-2 border-white/40">
          <Dices className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-pink-500/90 text-white flex items-center justify-center border-2 border-white shadow animate-pulse">
          <Heart className="w-4 h-4 fill-white" />
        </div>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
      >
        <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(236,72,153,0.7)]">
          NKJ
        </span>
        <span className="text-white/70 mx-1 font-light italic text-2xl sm:text-3xl">x</span>
        <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          MNT KAUR
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-base sm:text-lg font-bold text-gray-300 uppercase tracking-widest mt-1.5"
      >
        Snake & Ladder
      </motion.p>

      {/* Cute quote */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-xs sm:text-sm font-medium text-pink-200/80 italic mt-3 max-w-xs"
      >
        &ldquo;Roll the dice. Climb the ladders. Blame the snakes. 🎲🐍🪜&rdquo;
      </motion.p>

      {/* Primary Action Buttons */}
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full flex flex-col gap-3.5 mt-8 max-w-xs"
      >
        <button
          onClick={onCreateClick}
          className="w-full py-4 px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] border border-pink-300/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>CREATE GAME</span>
        </button>

        <button
          onClick={onJoinClick}
          className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base bg-[#151326] hover:bg-[#1f1c38] text-cyan-200 hover:text-white border border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <span>JOIN GAME</span>
        </button>
      </motion.div>

      {/* Subtle details hint */}
      <div className="mt-8 text-[11px] text-gray-500 flex items-center gap-2">
        <span>Realtime 2-Player</span>
        <span>•</span>
        <span>No Login Required</span>
        <span>•</span>
        <span>Mobile Optimized</span>
      </div>
    </div>
  );
};
