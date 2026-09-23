import React from 'react';
import { LADDERS, SNAKES } from '../../game/boardConfig';

interface BoardTileProps {
  number: number;
}

export const BoardTile: React.FC<BoardTileProps> = ({ number }) => {
  const isOne = number === 1;
  const isFive = number === 5;
  const hasSnake = SNAKES.some((s) => s.from === number);
  const hasLadder = LADDERS.some((l) => l.from === number);

  // Intentional plain/basic background for Tile 1
  if (isOne) {
    return (
      <div 
        className="w-full h-full relative flex items-center justify-center bg-[#100f1a] border border-[#1e1c2b] select-none"
        data-tile={number}
      />
    );
  }

  // The Centerpiece Lucky Tile 5 Surface!
  if (isFive) {
    return (
      <div 
        className="w-full h-full relative tile-five-glow rounded-md select-none overflow-hidden"
        data-tile={number}
      >
        {/* Ambient radial lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-pink-900/40 via-transparent to-amber-500/20 pointer-events-none" />
      </div>
    );
  }

  // Standard elegant tiles (2-4, 6-100)
  const isEven = (Math.floor((number - 1) / 10) + ((number - 1) % 10)) % 2 === 0;

  return (
    <div
      className={`w-full h-full relative rounded-sm select-none transition-all duration-150 border ${
        isEven 
          ? 'bg-[#151326]/90 border-white/[0.04]' 
          : 'bg-[#1b1830]/80 border-white/[0.06]'
      } hover:border-pink-500/30`}
      data-tile={number}
    >
      {/* Subtle bottom-right indicator for snake heads or ladder bases on base tile */}
      {hasSnake && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] leading-none opacity-60 pointer-events-none" title="Pink Snake Head">
          🐍
        </span>
      )}
      {hasLadder && (
        <span className="absolute bottom-0.5 right-0.5 text-[8px] leading-none opacity-60 pointer-events-none" title="White Ladder Base">
          🪜
        </span>
      )}
    </div>
  );
};
