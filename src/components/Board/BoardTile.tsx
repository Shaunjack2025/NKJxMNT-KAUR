import React from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { LADDERS, SNAKES } from '../../game/boardConfig';

interface BoardTileProps {
  number: number;
}

export const BoardTile: React.FC<BoardTileProps> = ({ number }) => {
  const isOne = number === 1;
  const isFive = number === 5;
  const hasSnake = SNAKES.some((s) => s.from === number);
  const hasLadder = LADDERS.some((l) => l.from === number);

  // Intentional plain/basic styling for Tile 1
  if (isOne) {
    return (
      <div 
        className="w-full h-full relative flex items-center justify-center bg-[#100f1a] border border-[#1e1c2b] text-gray-500 select-none group"
        data-tile={number}
      >
        <span className="text-xs font-mono font-medium opacity-60">1</span>
        <span className="absolute bottom-0.5 text-[8px] text-gray-600 uppercase tracking-tighter">Start</span>
      </div>
    );
  }

  // The Centerpiece Lucky Tile 5!
  if (isFive) {
    return (
      <div 
        className="w-full h-full relative flex flex-col items-center justify-center tile-five-glow rounded-md select-none overflow-hidden"
        data-tile={number}
      >
        {/* Floating Sparkles and Star particles */}
        <div className="absolute top-0.5 right-0.5 text-amber-300 animate-sparkle">
          <Sparkles className="w-2.5 h-2.5 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
        </div>
        <div className="absolute bottom-0.5 left-0.5 text-pink-400 animate-sparkle" style={{ animationDelay: '0.8s' }}>
          <Sparkles className="w-2 h-2 drop-shadow-[0_0_6px_rgba(236,72,153,0.9)]" />
        </div>

        {/* Lucky Crown Badge */}
        <Crown className="w-3 h-3 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] mb-[-2px]" />

        {/* Prominent Number 5 Typography */}
        <span className="text-base sm:text-lg font-black bg-gradient-to-br from-amber-200 via-pink-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
          5
        </span>

        {/* Lucky Ladder Tag */}
        <span className="text-[7px] sm:text-[8px] font-bold text-amber-200 uppercase tracking-wider bg-black/40 px-1 rounded border border-amber-400/40 mt-[-1px]">
          LUCKY
        </span>
      </div>
    );
  }

  // Standard elegant tiles (2-4, 6-100)
  const isEven = (Math.floor((number - 1) / 10) + ((number - 1) % 10)) % 2 === 0;

  return (
    <div
      className={`w-full h-full relative flex items-center justify-center rounded-sm select-none transition-all duration-150 border ${
        isEven 
          ? 'bg-[#151326]/90 border-white/[0.04]' 
          : 'bg-[#1b1830]/80 border-white/[0.06]'
      } hover:border-pink-500/30`}
      data-tile={number}
    >
      {/* Tile Number with subtle readability */}
      <span className={`text-[10px] sm:text-xs font-semibold ${
        number === 100 
          ? 'text-pink-400 font-extrabold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' 
          : 'text-gray-400 group-hover:text-gray-200'
      }`}>
        {number === 100 ? '🏆 100' : number}
      </span>

      {/* Subtle indicator for snake heads or ladder bases */}
      {hasSnake && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] leading-none opacity-80" title="Pink Snake Head">
          🐍
        </span>
      )}
      {hasLadder && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] leading-none opacity-80" title="White Ladder Base">
          🪜
        </span>
      )}
    </div>
  );
};
