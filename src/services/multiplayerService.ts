import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Player, PlayerNumber, Room, RoomStatus, GameEventPayload, MoveStep } from '../types/game';
import { savePlayerSession, getSavedSession } from '../lib/storage';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateSessionToken(): string {
  return 'tok_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Fallback in-memory store for instant multi-tab testing if Supabase credentials are not set
const localRooms: Map<string, { room: Room; players: Player[] }> = new Map();
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('nkj_mnt_local_sync');
  }
} catch {
  // Ignore BroadcastChannel errors in restricted contexts
}

export class MultiplayerService {
  /**
   * Create a new room with Player 1
   */
  static async createRoom(creatorName: string): Promise<{ room: Room; player: Player }> {
    const roomCode = generateRoomCode();
    const sessionToken = generateSessionToken();

    if (isSupabaseConfigured() && supabase) {
      // 1. Insert room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          status: 'waiting',
          current_turn: 1,
        })
        .select()
        .single();

      if (roomError || !roomData) {
        throw new Error(`Failed to create room: ${roomError?.message || 'Unknown error'}`);
      }

      // 2. Insert Player 1
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: creatorName.trim(),
          player_number: 1,
          position: 0,
          session_token: sessionToken,
          connected: true,
        })
        .select()
        .single();

      if (playerError || !playerData) {
        throw new Error(`Failed to create player: ${playerError?.message || 'Unknown error'}`);
      }

      savePlayerSession({
        roomCode,
        roomId: roomData.id,
        playerNumber: 1,
        playerName: creatorName.trim(),
        sessionToken,
      });

      return { room: roomData as Room, player: playerData as Player };
    } else {
      // Local fallback mode
      const roomId = 'room_' + Date.now();
      const newRoom: Room = {
        id: roomId,
        room_code: roomCode,
        status: 'waiting',
        current_turn: 1,
        winner_id: null,
        winner_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const newPlayer: Player = {
        id: 'player_1_' + Date.now(),
        room_id: roomId,
        name: creatorName.trim(),
        player_number: 1,
        position: 0,
        session_token: sessionToken,
        connected: true,
      };

      localRooms.set(roomCode.toUpperCase(), { room: newRoom, players: [newPlayer] });
      savePlayerSession({
        roomCode,
        roomId,
        playerNumber: 1,
        playerName: creatorName.trim(),
        sessionToken,
      });

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'ROOM_UPDATE', roomCode, room: newRoom, players: [newPlayer] });
      }

      return { room: newRoom, player: newPlayer };
    }
  }

  /**
   * Join an existing room
   */
  static async joinRoom(roomCode: string, playerName: string): Promise<{ room: Room; player: Player }> {
    const formattedCode = roomCode.trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      // 1. Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select()
        .eq('room_code', formattedCode)
        .single();

      if (roomError || !roomData) {
        throw new Error('Room not found. Please check your invite code.');
      }

      // 2. Fetch existing players
      const { data: playersData } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomData.id);

      const existingPlayers = (playersData || []) as Player[];
      const saved = getSavedSession(formattedCode);

      // Reconnect if session matches
      if (saved) {
        const found = existingPlayers.find((p) => p.session_token === saved.sessionToken || p.player_number === saved.playerNumber);
        if (found) {
          return { room: roomData as Room, player: found };
        }
      }

      // Check if slot 2 is open
      const player2 = existingPlayers.find((p) => p.player_number === 2);

      if (player2) {
        throw new Error('This game room is already full (2 players).');
      }

      const sessionToken = generateSessionToken();

      // Insert Player 2
      const { data: newPlayerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName.trim(),
          player_number: 2,
          position: 0,
          session_token: sessionToken,
          connected: true,
        })
        .select()
        .single();

      if (playerError || !newPlayerData) {
        throw new Error(`Failed to join: ${playerError?.message || 'Database error'}`);
      }

      // Update room status to 'playing'
      const { data: updatedRoom } = await supabase
        .from('rooms')
        .update({ status: 'playing', updated_at: new Date().toISOString() })
        .eq('id', roomData.id)
        .select()
        .single();

      savePlayerSession({
        roomCode: formattedCode,
        roomId: roomData.id,
        playerNumber: 2,
        playerName: playerName.trim(),
        sessionToken,
      });

      return { room: (updatedRoom || roomData) as Room, player: newPlayerData as Player };
    } else {
      // Local fallback mode
      const entry = localRooms.get(formattedCode);
      if (!entry) {
        throw new Error('Room not found. Please check your invite code.');
      }

      const saved = getSavedSession(formattedCode);
      if (saved) {
        const found = entry.players.find((p) => p.player_number === saved.playerNumber);
        if (found) return { room: entry.room, player: found };
      }

      if (entry.players.length >= 2) {
        throw new Error('This game room is already full.');
      }

      const sessionToken = generateSessionToken();
      const newPlayer: Player = {
        id: 'player_2_' + Date.now(),
        room_id: entry.room.id,
        name: playerName.trim(),
        player_number: 2,
        position: 0,
        session_token: sessionToken,
        connected: true,
      };

      entry.players.push(newPlayer);
      entry.room.status = 'playing';

      savePlayerSession({
        roomCode: formattedCode,
        roomId: entry.room.id,
        playerNumber: 2,
        playerName: playerName.trim(),
        sessionToken,
      });

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'ROOM_UPDATE', roomCode: formattedCode, room: entry.room, players: entry.players });
      }

      return { room: entry.room, player: newPlayer };
    }
  }

  /**
   * Fetch current room and player state
   */
  static async getRoomDetails(roomCode: string): Promise<{ room: Room | null; players: Player[] }> {
    const formattedCode = roomCode.trim().toUpperCase();

    if (isSupabaseConfigured() && supabase) {
      const { data: roomData } = await supabase
        .from('rooms')
        .select()
        .eq('room_code', formattedCode)
        .single();

      if (!roomData) return { room: null, players: [] };

      const { data: playersData } = await supabase
        .from('players')
        .select()
        .eq('room_id', roomData.id)
        .order('player_number', { ascending: true });

      return {
        room: roomData as Room,
        players: (playersData || []) as Player[],
      };
    } else {
      const entry = localRooms.get(formattedCode);
      if (!entry) return { room: null, players: [] };
      return { room: entry.room, players: entry.players };
    }
  }

  /**
   * Broadcast roll event to room channel
   */
  static async broadcastDiceRoll(
    roomId: string,
    playerNumber: PlayerNumber,
    diceValue: number,
    steps: MoveStep[]
  ): Promise<void> {
    const payload: GameEventPayload = {
      type: 'ROLL_DICE',
      room_id: roomId,
      player_number: playerNumber,
      dice_value: diceValue,
      steps,
      timestamp: Date.now(),
    };

    if (isSupabaseConfigured() && supabase) {
      const channel = supabase.channel(`game:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'dice_roll',
        payload,
      });
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'GAME_EVENT', payload });
    }
  }

  /**
   * Commit authoritative move result to database
   */
  static async commitMove(
    roomId: string,
    playerNumber: PlayerNumber,
    newPosition: number,
    nextTurn: PlayerNumber,
    winnerName: string | null = null
  ): Promise<void> {
    const status: RoomStatus = winnerName ? 'finished' : 'playing';

    if (isSupabaseConfigured() && supabase) {
      // Update player position
      await supabase
        .from('players')
        .update({
          position: newPosition,
          updated_at: new Date().toISOString(),
        })
        .match({ room_id: roomId, player_number: playerNumber });

      // Update room state
      await supabase
        .from('rooms')
        .update({
          current_turn: nextTurn,
          winner_name: winnerName,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);
    } else {
      // Local fallback update
      for (const [, val] of localRooms.entries()) {
        if (val.room.id === roomId) {
          const player = val.players.find((p) => p.player_number === playerNumber);
          if (player) player.position = newPosition;
          val.room.current_turn = nextTurn;
          val.room.winner_name = winnerName;
          val.room.status = status;

          if (broadcastChannel) {
            broadcastChannel.postMessage({
              type: 'ROOM_UPDATE',
              roomCode: val.room.room_code,
              room: val.room,
              players: val.players,
            });
          }
          break;
        }
      }
    }
  }

  /**
   * Reset game to play again
   */
  static async resetGame(roomId: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('players')
        .update({ position: 0, updated_at: new Date().toISOString() })
        .eq('room_id', roomId);

      await supabase
        .from('rooms')
        .update({
          status: 'playing',
          current_turn: 1,
          winner_name: null,
          winner_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      const channel = supabase.channel(`game:${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'restart_game',
        payload: { type: 'RESTART_GAME', room_id: roomId, timestamp: Date.now() },
      });
    } else {
      for (const [, val] of localRooms.entries()) {
        if (val.room.id === roomId) {
          val.players.forEach((p) => (p.position = 0));
          val.room.status = 'playing';
          val.room.current_turn = 1;
          val.room.winner_name = null;
          val.room.winner_id = null;

          if (broadcastChannel) {
            broadcastChannel.postMessage({
              type: 'ROOM_UPDATE',
              roomCode: val.room.room_code,
              room: val.room,
              players: val.players,
            });
            broadcastChannel.postMessage({
              type: 'GAME_EVENT',
              payload: { type: 'RESTART_GAME', room_id: roomId, timestamp: Date.now() },
            });
          }
          break;
        }
      }
    }
  }

  /**
   * Subscribe to real-time updates for a room
   */
  static subscribeToRoom(
    roomId: string,
    handlers: {
      onRoomUpdate: (room: Room) => void;
      onPlayersUpdate: (players: Player[]) => void;
      onGameEvent: (event: GameEventPayload) => void;
      onStatusChange: (status: 'connected' | 'connecting' | 'disconnected') => void;
    }
  ): () => void {
    if (isSupabaseConfigured() && supabase) {
      handlers.onStatusChange('connecting');

      const channel = supabase.channel(`game:${roomId}`, {
        config: { broadcast: { self: false } },
      });

      // Listen for broadcast events (dice rolls, steps)
      channel
        .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
          handlers.onGameEvent(payload as GameEventPayload);
        })
        .on('broadcast', { event: 'restart_game' }, ({ payload }) => {
          handlers.onGameEvent(payload as GameEventPayload);
        })
        // Listen for Postgres database changes
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
          (change) => {
            if (change.new) {
              handlers.onRoomUpdate(change.new as Room);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
          async () => {
            // Refetch all players for consistent order
            if (!supabase) return;
            const { data } = await supabase
              .from('players')
              .select()
              .eq('room_id', roomId)
              .order('player_number', { ascending: true });
            if (data) {
              handlers.onPlayersUpdate(data as Player[]);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            handlers.onStatusChange('connected');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            handlers.onStatusChange('disconnected');
          }
        });

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    } else {
      // Local fallback channel
      handlers.onStatusChange('connected');

      const onMessage = (e: MessageEvent) => {
        const data = e.data;
        if (!data) return;
        if (data.type === 'ROOM_UPDATE' && data.room?.id === roomId) {
          handlers.onRoomUpdate(data.room);
          handlers.onPlayersUpdate(data.players);
        } else if (data.type === 'GAME_EVENT' && data.payload?.room_id === roomId) {
          handlers.onGameEvent(data.payload);
        }
      };

      if (broadcastChannel) {
        broadcastChannel.addEventListener('message', onMessage);
      }

      return () => {
        if (broadcastChannel) {
          broadcastChannel.removeEventListener('message', onMessage);
        }
      };
    }
  }
}
