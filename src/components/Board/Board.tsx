import React, { useMemo } from 'react';
import { BoardTile } from './BoardTile';
import { SnakesOverlay } from './SnakesOverlay';
import { LaddersOverlay } from './LaddersOverlay';
import { PlayerTokens } from './PlayerTokens';
import { NumberLabelsLayer } from './NumberLabelsLayer';
import { TileFiveCelebration } from './TileFiveCelebration';
import type { Player } from '../../types/game';

interface BoardProps {
  players: Player[];
  activePlayerNumber: 1 | 2;
  isFiveCelebration?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  players,
  activePlayerNumber,
  isFiveCelebration = false,
}) => {
  // Generate the 100 tile numbers in standard boustrophedon order (top to bottom)
  const tilesInOrder = useMemo(() => {
    const list: number[] = [];
    for (let r = 9; r >= 0; r--) {
      const isEvenRow = r % 2 === 0;
      if (isEvenRow) {
        // Left to right
        for (let c = 1; c <= 10; c++) {
          list.push(r * 10 + c);
        }
      } else {
        // Right to left (100 to 91, 40 to 31, 20 to 11)
        for (let c = 10; c >= 1; c--) {
          list.push(r * 10 + c);
        }
      }
    }
    return list;
  }, []);

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto p-1.5 sm:p-2.5 rounded-2xl bg-[#110f22]/90 border border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.6),0_0_20px_rgba(236,72,153,0.15)] select-none">
      {/* Outer subtle edge ambient glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-transparent to-purple-500/20 pointer-events-none -z-10 blur-sm" />

      {/* Layer 1: 10x10 Grid of Tile Surfaces (z-0) */}
      <div className="grid grid-cols-10 grid-rows-10 gap-0.5 sm:gap-1 w-full h-full relative z-0">
        {tilesInOrder.map((tileNumber) => (
          <BoardTile key={tileNumber} number={tileNumber} />
        ))}
      </div>

      {/* Layer 2: Pure WHITE Ladders (z-10) with special anchor for Master Ladder 5 */}
      <LaddersOverlay />

      {/* Layer 3: All PINK Snakes (z-15) */}
      <SnakesOverlay />

      {/* Layer 4: Real-time Player Tokens (z-20) */}
      <PlayerTokens players={players} activePlayerNumber={activePlayerNumber} />

      {/* Layer 5: NUMBER LABELS LAYER (z-30) - ALWAYS ABOVE SNAKES & LADDERS */}
      <NumberLabelsLayer
        tilesInOrder={tilesInOrder}
        isFiveCelebration={isFiveCelebration}
      />

      {/* Layer 6: Temporary Tile 5 Landing Celebration Burst (z-40) */}
      <TileFiveCelebration isActive={isFiveCelebration} />
    </div>
  );
};
