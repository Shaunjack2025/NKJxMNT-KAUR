import React from 'react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center pt-3 pb-1 select-none text-center">
      {/* Prominent main identity title */}
      <motion.h1
        initial={{ opacity: 0, y: -15, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight animate-heading-pop cursor-default"
      >
        <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(236,72,153,0.7)]">
          NKJ
        </span>
        <span className="text-white/80 mx-1 font-light italic text-xl sm:text-2xl">x</span>
        <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          MNT KAUR
        </span>
        <span className="inline-block ml-1.5 text-xl sm:text-2xl animate-float">🎲</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-xs sm:text-sm font-medium text-pink-200/70 tracking-wide mt-0.5 flex items-center gap-1.5"
      >
        <span>Our little game</span>
        <span className="text-pink-400">♥</span>
      </motion.p>
    </header>
  );
};
