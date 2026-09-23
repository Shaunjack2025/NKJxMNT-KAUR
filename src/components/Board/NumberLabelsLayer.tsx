import React from 'react';
import { Sparkles, Crown } from 'lucide-react';

interface NumberLabelsLayerProps {
  tilesInOrder: number[];
  isFiveCelebration?: boolean;
}

export const NumberLabelsLayer: React.FC<NumberLabelsLayerProps> = ({
  tilesInOrder,
  isFiveCelebration = false,
}) => {
  return (
    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0.5 sm:gap-1 p-1.5 sm:p-2.5 pointer-events-none z-30 select-none">
      {tilesInOrder.map((number) => {
        const isOne = number === 1;
        const isFive = number === 5;

        // Number 1: intentionally minimal
        if (isOne) {
          return (
            <div
              key={`label-${number}`}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <span className="text-[10px] sm:text-xs font-mono font-medium text-gray-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                1
              </span>
              <span className="text-[7px] text-gray-500 uppercase tracking-tighter -mt-0.5">
                Start
              </span>
            </div>
          );
        }

        // Special Number 5: Her Birthday Easter Egg! Always 100% visible on top!
        if (isFive) {
          return (
            <div
              key={`label-${number}`}
              className={`w-full h-full flex flex-col items-center justify-center relative transition-transform ${
                isFiveCelebration ? 'scale-115 animate-bounce' : ''
              }`}
            >
              {/* Crown badge */}
              <Crown className="w-3 h-3 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] mb-[-2px] animate-pulse" />

              {/* Bold, prominent Number 5 */}
              <span className="text-lg sm:text-xl font-black bg-gradient-to-br from-amber-200 via-pink-200 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(236,72,153,0.9)] tracking-tight">
                5
              </span>

              {/* Lucky badge label */}
              <span className="text-[7px] sm:text-[8px] font-black text-amber-200 uppercase tracking-wider bg-black/60 px-1 rounded border border-amber-400/50 shadow-sm mt-[-2px]">
                LUCKY
              </span>

              {/* Corner Sparkles */}
              <Sparkles className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-sparkle" />
              <Sparkles
                className="absolute bottom-0.5 left-0.5 w-2 h-2 text-pink-300 drop-shadow-[0_0_6px_rgba(236,72,153,0.9)] animate-sparkle"
                style={{ animationDelay: '0.9s' }}
              />
            </div>
          );
        }

        // Tiles 2–4, 6–100: Clean, bold, high-contrast numbers that never get covered
        const isCentury = number === 100;

        return (
          <div
            key={`label-${number}`}
            className="w-full h-full flex items-center justify-center relative"
          >
            <span
              className={`font-bold transition-colors select-none ${
                isCentury
                  ? 'text-pink-300 font-black text-xs sm:text-sm drop-shadow-[0_0_10px_rgba(236,72,153,0.9)]'
                  : 'text-gray-200 text-[10px] sm:text-xs drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]'
              }`}
            >
              {isCentury ? '🏆 100' : number}
            </span>
          </div>
        );
      })}
    </div>
  );
};
