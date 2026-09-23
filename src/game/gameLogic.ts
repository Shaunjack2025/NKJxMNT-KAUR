import type { MoveStep, PlayerNumber, SnakeOrLadder } from '../types/game';
import { checkSpecialTile } from './boardConfig';

export interface MoveCalculationResult {
  canMove: boolean;
  landingPosition: number;
  finalPosition: number;
  steps: MoveStep[];
  specialTile: SnakeOrLadder | null;
  isWin: boolean;
  message?: string;
  nextTurn: PlayerNumber;
}

/**
 * Calculates authoritative movement outcome for a roll.
 */
export function calculateMove(
  currentPos: number,
  diceRoll: number,
  playerNumber: PlayerNumber
): MoveCalculationResult {
  const nextPlayerNumber: PlayerNumber = playerNumber === 1 ? 2 : 1;
  const targetPos = currentPos + diceRoll;

  // Overshoot rule: exact 100 required
  if (targetPos > 100) {
    return {
      canMove: false,
      landingPosition: currentPos,
      finalPosition: currentPos,
      steps: [],
      specialTile: null,
      isWin: false,
      message: `Need exact roll of ${100 - currentPos} to reach 100!`,
      nextTurn: nextPlayerNumber,
    };
  }

  // Generate step-by-step incremental hops
  const steps: MoveStep[] = [];
  for (let i = currentPos + 1; i <= targetPos; i++) {
    steps.push({ position: i, type: 'step' });
  }

  // Check if landing position has a snake or ladder
  const special = checkSpecialTile(targetPos);
  let finalPos = targetPos;
  let message: string | undefined;

  if (special) {
    if (special.type === 'ladder') {
      steps.push({ position: special.to, type: 'ladder' });
      finalPos = special.to;
      message = special.isMaster 
        ? "⭐ Lucky Tile 5! Master Ladder Climb!" 
        : "🪜 Climb!";
    } else if (special.type === 'snake') {
      steps.push({ position: special.to, type: 'snake' });
      finalPos = special.to;
      message = "🐍 Snake! Down you go!";
    }
  }

  const isWin = finalPos === 100;

  return {
    canMove: true,
    landingPosition: targetPos,
    finalPosition: finalPos,
    steps,
    specialTile: special,
    isWin,
    message,
    nextTurn: nextPlayerNumber,
  };
}
