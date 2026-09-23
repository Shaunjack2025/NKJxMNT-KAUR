import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundManager } from '../../game/soundManager';

interface WinModalProps {
  isOpen: boolean;
  winnerName: string;
  isMyWin: boolean;
  onPlayAgain: () => void;
  onReturnToHome: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  winnerName,
  isMyWin,
  onPlayAgain,
  onReturnToHome,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playWin();

      // Launch multi-burst celebration confetti
      const duration = 3.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: 0.15 + Math.random() * 0.7, y: Math.random() - 0.2 },
          colors: ['#ec4899', '#f43f5e', '#06b6d4', '#fbbf24', '#ffffff'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c1833] to-[#110e22] border-2 border-pink-500/50 p-6 text-center shadow-[0_0_50px_rgba(236,72,153,0.4)] relative overflow-hidden"
          >
            {/* Background glowing radiant aura */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-pink-500/30 blur-3xl pointer-events-none" />

            {/* Floating sparkles */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-rose-400 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4 border-white/80">
                  <Trophy className="w-10 h-10 text-white drop-shadow" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-300 animate-sparkle" />
              </div>
            </div>

            {/* Victory Title */}
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent drop-shadow">
              🎉 {winnerName.toUpperCase()} WINS! 🎉
            </h2>

            <p className="text-gray-300 text-xs sm:text-sm mt-2 font-medium">
              {isMyWin
                ? "Incredible game! You conquered the board and reached 100!"
                : `${winnerName} has rolled their way to the ultimate victory!`}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-6">
              <button
                onClick={onPlayAgain}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-pink-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                PLAY AGAIN
              </button>

              <button
                onClick={onReturnToHome}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#161426] hover:bg-[#1f1c35] text-gray-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Home className="w-4 h-4" />
                RETURN TO ROOM
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
