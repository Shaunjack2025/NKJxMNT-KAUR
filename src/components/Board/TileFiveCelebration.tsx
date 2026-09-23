import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { getTileCoordinates } from '../../game/boardConfig';

interface TileFiveCelebrationProps {
  isActive: boolean;
}

export const TileFiveCelebration: React.FC<TileFiveCelebrationProps> = ({ isActive }) => {
  const coords = getTileCoordinates(5); // { x: 45, y: 95 }

  return (
    <AnimatePresence>
      {isActive && (
        <div
          className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `${coords.x}%`,
            top: `${coords.y}%`,
          }}
        >
          {/* Expanding pink energy ripple */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute w-14 h-14 rounded-full border-2 border-pink-400 bg-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.9)]"
          />

          {/* Secondary golden glow ring */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
            className="absolute w-12 h-12 rounded-full border border-amber-300 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.8)]"
          />

          {/* Floating celebratory mini hearts and sparkles */}
          <motion.div
            initial={{ y: 0, opacity: 1, scale: 0.6 }}
            animate={{ y: -38, opacity: 0, scale: 1.2 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute -top-3 text-pink-400"
          >
            <Heart className="w-5 h-5 fill-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,1)]" />
          </motion.div>

          <motion.div
            initial={{ x: -15, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: -28, y: -26, opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="absolute text-amber-300"
          >
            <Sparkles className="w-4 h-4 drop-shadow-[0_0_6px_rgba(251,191,36,1)]" />
          </motion.div>

          <motion.div
            initial={{ x: 15, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: 28, y: -26, opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            className="absolute text-pink-300"
          >
            <Sparkles className="w-4 h-4 drop-shadow-[0_0_6px_rgba(236,72,153,1)]" />
          </motion.div>

          {/* Pop badge: "✨ 5 ✨" */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 1] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-black text-[9px] shadow-[0_0_15px_rgba(236,72,153,0.9)] border border-white/60 whitespace-nowrap"
          >
            ✨ 5 BIRTHDAY ✨
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
