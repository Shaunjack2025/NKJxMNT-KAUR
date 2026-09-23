import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface Dice3DProps {
  value: number; // 1 to 6
  isRolling: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showFiveCelebration?: boolean;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  disabled = false,
  onClick,
  showFiveCelebration = false,
}) => {
  // Compute rotation angles for the dice face
  const rotation = useMemo(() => {
    switch (value) {
      case 1:
        return { x: 0, y: 0 };
      case 2:
        return { x: 0, y: -90 };
      case 3:
        return { x: 90, y: 0 };
      case 4:
        return { x: -90, y: 0 };
      case 5:
        return { x: 0, y: 90 };
      case 6:
        return { x: 0, y: 180 };
      default:
        return { x: 0, y: 0 };
    }
  }, [value]);

  const isFive = value === 5 && !isRolling;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Easter Egg Celebration when rolling 5 (Her Birthday Special) */}
      <AnimatePresence>
        {(isFive || showFiveCelebration) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: -14, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.8 }}
            transition={{ duration: 0.45, ease: 'backOut' }}
            className="absolute -top-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-black text-xs shadow-[0_0_20px_rgba(236,72,153,0.8)] border border-pink-200/50 pointer-events-none select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-sparkle" />
            <Heart className="w-3 h-3 fill-pink-200 text-pink-200" />
            <span className="tracking-wide">SPECIAL FIVE</span>
            <Heart className="w-3 h-3 fill-pink-200 text-pink-200" />
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-sparkle" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer ambient glow pulse when resting on 5 */}
      {isFive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500/30 to-amber-400/20 blur-xl pointer-events-none -z-10"
        />
      )}

      {/* 3D Dice Scene */}
      <div
        onClick={!disabled && !isRolling ? onClick : undefined}
        className={`dice-scene mx-auto cursor-pointer transition-transform ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:scale-105 active:scale-95'
        }`}
        title={disabled ? 'Waiting for turn...' : 'Click to roll!'}
      >
        <motion.div
          className="dice-cube"
          animate={
            isRolling
              ? {
                  rotateX: [0, 360, 720, 1080, 1440 + rotation.x],
                  rotateY: [0, 720, 1080, 1440, 1800 + rotation.y],
                  scale: [1, 1.18, 0.95, 1.1, 1],
                }
              : {
                  rotateX: rotation.x,
                  rotateY: rotation.y,
                  scale: isFive ? [1, 1.08, 1] : 1,
                }
          }
          transition={
            isRolling
              ? { duration: 1.1, ease: [0.25, 1, 0.5, 1] }
              : { duration: isFive ? 0.6 : 0.4, ease: 'easeOut' }
          }
        >
          {/* Face 1 */}
          <div className="dice-face dice-face-1 flex items-center justify-center">
            <span className="pip pip-pink w-4 h-4 scale-125" />
          </div>

          {/* Face 2 */}
          <div className="dice-face dice-face-2 grid grid-cols-2 grid-rows-2 p-3">
            <span className="pip justify-self-start self-start" />
            <span className="pip justify-self-end self-end col-start-2 row-start-2" />
          </div>

          {/* Face 3 */}
          <div className="dice-face dice-face-3 grid grid-cols-3 grid-rows-3 p-2.5">
            <span className="pip justify-self-start self-start col-start-1 row-start-1" />
            <span className="pip pip-pink justify-self-center self-center col-start-2 row-start-2" />
            <span className="pip justify-self-end self-end col-start-3 row-start-3" />
          </div>

          {/* Face 4 */}
          <div className="dice-face dice-face-4 grid grid-cols-2 grid-rows-2 p-3">
            <span className="pip justify-self-start self-start" />
            <span className="pip justify-self-end self-start" />
            <span className="pip justify-self-start self-end" />
            <span className="pip justify-self-end self-end" />
          </div>

          {/* Face 5 — Special Unique Glowing Design for Her Birthday 5! */}
          <div
            className={`dice-face dice-face-5 grid grid-cols-3 grid-rows-3 p-2.5 transition-all ${
              isFive
                ? 'border-2 border-amber-300 shadow-[0_0_20px_rgba(236,72,153,0.9),inset_0_0_12px_rgba(254,240,138,0.6)]'
                : ''
            }`}
          >
            <span className="pip justify-self-start self-start col-start-1 row-start-1" />
            <span className="pip justify-self-end self-start col-start-3 row-start-1" />
            <span className="pip pip-pink justify-self-center self-center col-start-2 row-start-2 w-3.5 h-3.5 shadow-[0_0_8px_rgba(236,72,153,1)]" />
            <span className="pip justify-self-start self-end col-start-1 row-start-3" />
            <span className="pip justify-self-end self-end col-start-3 row-start-3" />
          </div>

          {/* Face 6 */}
          <div className="dice-face dice-face-6 grid grid-cols-2 grid-rows-3 p-2.5">
            <span className="pip justify-self-start self-center" />
            <span className="pip justify-self-end self-center" />
            <span className="pip justify-self-start self-center" />
            <span className="pip justify-self-end self-center" />
            <span className="pip justify-self-start self-center" />
            <span className="pip justify-self-end self-center" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
