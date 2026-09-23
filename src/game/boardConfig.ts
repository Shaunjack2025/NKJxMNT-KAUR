import type { SnakeOrLadder } from '../types/game';

// Ladders: ALL WHITE, with #5 being the special master ladder
export const LADDERS: SnakeOrLadder[] = [
  { from: 5, to: 58, type: 'ladder', isMaster: true }, // The SPECIAL center-stage ladder!
  { from: 9, to: 31, type: 'ladder' },
  { from: 21, to: 42, type: 'ladder' },
  { from: 28, to: 76, type: 'ladder' },
  { from: 51, to: 67, type: 'ladder' },
  { from: 72, to: 91, type: 'ladder' },
  { from: 80, to: 99, type: 'ladder' },
];

// Snakes: ALL PINK!
export const SNAKES: SnakeOrLadder[] = [
  { from: 98, to: 40, type: 'snake' },
  { from: 93, to: 68, type: 'snake' },
  { from: 87, to: 53, type: 'snake' },
  { from: 62, to: 19, type: 'snake' },
  { from: 54, to: 34, type: 'snake' },
  { from: 38, to: 15, type: 'snake' },
  { from: 17, to: 7, type: 'snake' },
];

/**
 * Returns the center coordinate in 0-100% space for a given tile number (1-100)
 */
export function getTileCoordinates(tileNumber: number): { x: number; y: number } {
  if (tileNumber <= 0) return { x: 5, y: 105 }; // Off board starting position
  if (tileNumber > 100) tileNumber = 100;

  const boardRow = Math.floor((tileNumber - 1) / 10); // 0 (bottom) to 9 (top)
  const yIndex = 9 - boardRow; // 9 (bottom) to 0 (top)
  const isEvenRow = boardRow % 2 === 0;

  let colIndex: number;
  if (isEvenRow) {
    colIndex = (tileNumber - 1) % 10; // Left to right
  } else {
    colIndex = 9 - ((tileNumber - 1) % 10); // Right to left
  }

  return {
    x: (colIndex + 0.5) * 10,
    y: (yIndex + 0.5) * 10,
  };
}

export function checkSpecialTile(position: number): SnakeOrLadder | null {
  const ladder = LADDERS.find((l) => l.from === position);
  if (ladder) return ladder;
  const snake = SNAKES.find((s) => s.from === position);
  if (snake) return snake;
  return null;
}
