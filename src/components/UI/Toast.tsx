import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToastMessage } from '../../types/game';

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 w-full max-w-sm flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`px-4 py-2.5 rounded-2xl shadow-xl text-center text-xs sm:text-sm font-bold border backdrop-blur-md ${
              toast.type === 'snake'
                ? 'bg-pink-950/90 border-pink-500 text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.5)]'
                : toast.type === 'ladder'
                ? 'bg-[#1e1c38]/90 border-amber-300 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                : 'bg-[#151326]/90 border-white/20 text-gray-200 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
