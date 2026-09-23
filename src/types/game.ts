export type PlayerNumber = 1 | 2;

export interface Player {
  id: string;
  room_id: string;
  name: string;
  player_number: PlayerNumber;
  position: number; // 0 (off-board) to 100
  session_token: string;
  connected: boolean;
  updated_at?: string;
}

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface Room {
  id: string;
  room_code: string;
  status: RoomStatus;
  current_turn: PlayerNumber;
  winner_id: string | null;
  winner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SnakeOrLadder {
  from: number;
  to: number;
  type: 'snake' | 'ladder';
  isMaster?: boolean; // For Tile 5's master ladder
}

export interface MoveStep {
  position: number;
  type: 'step' | 'snake' | 'ladder';
}

export interface GameEventPayload {
  type: 'ROLL_DICE' | 'MOVE_PLAYER' | 'GAME_OVER' | 'RESTART_GAME' | 'PLAYER_JOINED';
  room_id: string;
  player_number: PlayerNumber;
  dice_value?: number;
  steps?: MoveStep[];
  final_position?: number;
  winner_name?: string;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'snake' | 'ladder' | 'info' | 'win';
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'demo';
