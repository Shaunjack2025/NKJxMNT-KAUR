import { supabase, isSupabaseConfigured, getSupabase, logSupabaseDiagnostics, supabaseUrl, supabaseAnonKey, supabaseInitError } from '../lib/supabase';
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

export class MultiplayerService {
  /**
   * Create a new room with Player 1 in Supabase
   */
  static async createRoom(creatorName: string): Promise<{ room: Room; player: Player }> {
    console.log('[NKJxMNT] ========================================');
    console.log('[NKJxMNT] CREATE ROOM START');
    console.log('[NKJxMNT] Creator Name:', creatorName);

    const client = getSupabase() || supabase;

    if (!isSupabaseConfigured()) {
      logSupabaseDiagnostics();
      console.error('[NKJxMNT] Cannot create room: Supabase environment variables are missing.');
      throw new Error(
        `Supabase is not configured on this deployed site. VITE_SUPABASE_URL is ${supabaseUrl ? 'FOUND' : 'MISSING'}, and VITE_SUPABASE_ANON_KEY is ${supabaseAnonKey ? 'FOUND' : 'MISSING'}.`
      );
    }

    if (!client) {
      logSupabaseDiagnostics();
      console.error('[NKJxMNT] Cannot create room: Supabase client failed to initialize.', supabaseInitError);
      throw new Error(
        `Failed to initialize Supabase client: ${supabaseInitError || 'Unknown error'}. Check browser console for details.`
      );
    }

    const roomCode = generateRoomCode().trim().toUpperCase();
    const sessionToken = generateSessionToken();

    console.log('[NKJxMNT] generated room code:', roomCode);

    // 1. Insert room into public.rooms
    const { data: roomData, error: roomError } = await client
      .from('rooms')
      .insert({
        room_code: roomCode,
        status: 'waiting',
        current_turn: 1,
      })
      .select()
      .single();

    if (roomError || !roomData) {
      console.error('[NKJxMNT] Supabase room insert failure:', {
        message: roomError?.message,
        details: roomError?.details,
        hint: roomError?.hint,
        code: roomError?.code,
      });
      throw new Error(
        `Failed to create room in Supabase: ${roomError?.message || 'No data returned'} (Code: ${roomError?.code || 'UNKNOWN'})`
      );
    }

    console.log('[NKJxMNT] Supabase room insert success');
    console.log('[NKJxMNT] created room ID:', roomData.id);

    // 2. Insert Player 1 into public.players
    const { data: playerData, error: playerError } = await client
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
      console.error('[NKJxMNT] player insert failure:', {
        message: playerError?.message,
        details: playerError?.details,
        hint: playerError?.hint,
        code: playerError?.code,
      });
      throw new Error(
        `Failed to register player in Supabase: ${playerError?.message || 'Database error'} (Code: ${playerError?.code || 'UNKNOWN'})`
      );
    }

    console.log('[NKJxMNT] player insert success (Player 1 ID:', playerData.id, ')');
    console.log('[NKJxMNT] CREATE ROOM SUCCESS');
    console.log('[NKJxMNT] ========================================');

    // 3. Save session in localStorage for page refresh/reconnect
    savePlayerSession({
      roomCode,
      roomId: roomData.id,
      playerNumber: 1,
      playerName: creatorName.trim(),
      sessionToken,
    });

    return { room: roomData as Room, player: playerData as Player };
  }

  /**
   * Join an existing room in Supabase
   */
  static async joinRoom(roomCode: string, playerName: string): Promise<{ room: Room; player: Player }> {
    console.log('[NKJxMNT] ========================================');
    console.log('[NKJxMNT] JOIN ROOM START');
    const formattedCode = roomCode.trim().toUpperCase();
    console.log('[NKJxMNT] querying room code:', formattedCode);

    const client = getSupabase() || supabase;

    if (!isSupabaseConfigured()) {
      logSupabaseDiagnostics();
      console.error('[NKJxMNT] Cannot join room: Supabase environment variables are missing.');
      throw new Error(
        `Supabase is not configured on this device. VITE_SUPABASE_URL is ${supabaseUrl ? 'FOUND' : 'MISSING'}, and VITE_SUPABASE_ANON_KEY is ${supabaseAnonKey ? 'FOUND' : 'MISSING'}.`
      );
    }

    if (!client) {
      logSupabaseDiagnostics();
      console.error('[NKJxMNT] Cannot join room: Supabase client failed to initialize.', supabaseInitError);
      throw new Error(
        `Failed to initialize Supabase client: ${supabaseInitError || 'Unknown error'}. Check browser console for details.`
      );
    }

    // 1. Fetch room using select('*') and maybeSingle()
    const { data: roomData, error: roomError } = await client
      .from('rooms')
      .select('*')
      .eq('room_code', formattedCode)
      .maybeSingle();

    if (roomError) {
      console.error('[NKJxMNT] Supabase room select failure:', {
        message: roomError.message,
        details: roomError.details,
        hint: roomError.hint,
        code: roomError.code,
      });
      throw new Error(`Database error looking up room: ${roomError.message} (Code: ${roomError.code})`);
    }

    if (!roomData) {
      console.warn(`[NKJxMNT] Room "${formattedCode}" does not exist in Supabase rooms table.`);
      throw new Error(`Room "${formattedCode}" not found in database. Please check your invite code.`);
    }

    console.log(`[NKJxMNT] Room "${formattedCode}" found (ID: ${roomData.id}, Status: ${roomData.status})`);

    // 2. Fetch existing players in this room
    const { data: playersData, error: playersError } = await client
      .from('players')
      .select('*')
      .eq('room_id', roomData.id);

    if (playersError) {
      console.error('[NKJxMNT] Error fetching existing players:', {
        message: playersError.message,
        details: playersError.details,
        hint: playersError.hint,
        code: playersError.code,
      });
      throw new Error(`Database error fetching room players: ${playersError.message}`);
    }

    const existingPlayers = (playersData || []) as Player[];
    const saved = getSavedSession(formattedCode);

    // Reconnect existing player if session token or slot matches
    if (saved) {
      const found = existingPlayers.find(
        (p) => p.session_token === saved.sessionToken || p.player_number === saved.playerNumber
      );
      if (found) {
        console.log(`[NKJxMNT] Reconnecting player ${found.name} (Player ${found.player_number})`);
        return { room: roomData as Room, player: found };
      }
    }

    // Check if slot 2 is open
    const player2 = existingPlayers.find((p) => p.player_number === 2);
    if (player2) {
      throw new Error('This game room is already full (both players have joined).');
    }

    const sessionToken = generateSessionToken();

    // 3. Insert Player 2 into public.players
    console.log(`[NKJxMNT] Registering Player 2 "${playerName}" in room ${roomData.id}...`);
    const { data: newPlayerData, error: playerError } = await client
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
      console.error('[NKJxMNT] Error inserting Player 2:', playerError);
      throw new Error(`Failed to join room: ${playerError?.message || 'Database error'}`);
    }

    // 4. Update room status to 'playing'
    const { data: updatedRoom, error: updateError } = await client
      .from('rooms')
      .update({ status: 'playing', updated_at: new Date().toISOString() })
      .eq('id', roomData.id)
      .select()
      .single();

    if (updateError) {
      console.warn('[NKJxMNT] Warning updating room status:', updateError);
    }

    savePlayerSession({
      roomCode: formattedCode,
      roomId: roomData.id,
      playerNumber: 2,
      playerName: playerName.trim(),
      sessionToken,
    });

    // 5. Broadcast to room channel that Player 2 joined
    const channel = client.channel(`game:${roomData.id}`);
    channel.send({
      type: 'broadcast',
      event: 'player_joined',
      payload: {
        type: 'PLAYER_JOINED',
        room_id: roomData.id,
        player: newPlayerData,
        timestamp: Date.now(),
      },
    }).catch((err) => {
      console.warn('[NKJxMNT] Non-critical error broadcasting player_joined:', err);
    });

    return { room: (updatedRoom || roomData) as Room, player: newPlayerData as Player };
  }

  /**
   * Fetch current room and player state from Supabase
   */
  static async getRoomDetails(roomCode: string): Promise<{ room: Room | null; players: Player[] }> {
    const client = getSupabase() || supabase;
    if (!isSupabaseConfigured() || !client) {
      console.warn('[NKJxMNT] Cannot getRoomDetails: Supabase is not configured.');
      return { room: null, players: [] };
    }

    const formattedCode = roomCode.trim().toUpperCase();

    // Query rooms table using select('*') and maybeSingle()
    const { data: roomData, error: roomError } = await client
      .from('rooms')
      .select('*')
      .eq('room_code', formattedCode)
      .maybeSingle();

    if (roomError) {
      console.error(`[NKJxMNT] Database error querying room "${formattedCode}":`, {
        message: roomError.message,
        details: roomError.details,
        hint: roomError.hint,
        code: roomError.code,
      });
      throw new Error(`Database error querying room: ${roomError.message}`);
    }

    if (!roomData) {
      console.warn(`[NKJxMNT] getRoomDetails: Room "${formattedCode}" not found in database.`);
      return { room: null, players: [] };
    }

    // Query players table using select('*')
    const { data: playersData, error: playersError } = await client
      .from('players')
      .select('*')
      .eq('room_id', roomData.id)
      .order('player_number', { ascending: true });

    if (playersError) {
      console.error(`[NKJxMNT] Database error querying players for room ${roomData.id}:`, {
        message: playersError.message,
        details: playersError.details,
        hint: playersError.hint,
        code: playersError.code,
      });
    }

    return {
      room: roomData as Room,
      players: (playersData || []) as Player[],
    };
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
    const client = getSupabase() || supabase;
    if (!isSupabaseConfigured() || !client) return;

    const payload: GameEventPayload = {
      type: 'ROLL_DICE',
      room_id: roomId,
      player_number: playerNumber,
      dice_value: diceValue,
      steps,
      timestamp: Date.now(),
    };

    const channel = client.channel(`game:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'dice_roll',
      payload,
    });
  }

  /**
   * Commit authoritative move result to Supabase database
   */
  static async commitMove(
    roomId: string,
    playerNumber: PlayerNumber,
    newPosition: number,
    nextTurn: PlayerNumber,
    winnerName: string | null = null
  ): Promise<void> {
    const client = getSupabase() || supabase;
    if (!isSupabaseConfigured() || !client) {
      console.error('[NKJxMNT] Cannot commitMove: Supabase is not configured.');
      return;
    }

    const status: RoomStatus = winnerName ? 'finished' : 'playing';

    // 1. Update player position in public.players
    const { error: playerError } = await client
      .from('players')
      .update({
        position: newPosition,
        updated_at: new Date().toISOString(),
      })
      .match({ room_id: roomId, player_number: playerNumber });

    if (playerError) {
      console.error('[NKJxMNT] Error updating player position in Supabase:', playerError);
    }

    // 2. Update room state in public.rooms
    const { error: roomError } = await client
      .from('rooms')
      .update({
        current_turn: nextTurn,
        winner_name: winnerName,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (roomError) {
      console.error('[NKJxMNT] Error updating room state in Supabase:', roomError);
    }
  }

  /**
   * Reset game to play again
   */
  static async resetGame(roomId: string): Promise<void> {
    const client = getSupabase() || supabase;
    if (!isSupabaseConfigured() || !client) {
      console.error('[NKJxMNT] Cannot resetGame: Supabase is not configured.');
      return;
    }

    // Reset players positions
    const { error: playersResetError } = await client
      .from('players')
      .update({ position: 0, updated_at: new Date().toISOString() })
      .eq('room_id', roomId);

    if (playersResetError) {
      console.error('[NKJxMNT] Error resetting players in Supabase:', playersResetError);
    }

    // Reset room state
    const { error: roomResetError } = await client
      .from('rooms')
      .update({
        status: 'playing',
        current_turn: 1,
        winner_name: null,
        winner_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (roomResetError) {
      console.error('[NKJxMNT] Error resetting room in Supabase:', roomResetError);
    }

    // Broadcast restart event to room channel
    const channel = client.channel(`game:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'restart_game',
      payload: { type: 'RESTART_GAME', room_id: roomId, timestamp: Date.now() },
    });
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
    const client = getSupabase() || supabase;
    if (!isSupabaseConfigured() || !client) {
      handlers.onStatusChange('disconnected');
      console.warn('[NKJxMNT] subscribeToRoom called without Supabase configuration.');
      return () => {};
    }

    handlers.onStatusChange('connecting');

    const channel = client.channel(`game:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    // Listen for broadcast events (dice rolls, steps, player joins, restarts)
    channel
      .on('broadcast', { event: 'dice_roll' }, ({ payload }) => {
        handlers.onGameEvent(payload as GameEventPayload);
      })
      .on('broadcast', { event: 'restart_game' }, ({ payload }) => {
        handlers.onGameEvent(payload as GameEventPayload);
      })
      .on('broadcast', { event: 'player_joined' }, async () => {
        // When Player 2 joins, immediately refetch room and players
        const activeClient = getSupabase() || supabase;
        if (!activeClient) return;
        const { data: playersData } = await activeClient
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('player_number', { ascending: true });
        if (playersData) {
          handlers.onPlayersUpdate(playersData as Player[]);
        }
        const { data: roomData } = await activeClient
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .maybeSingle();
        if (roomData) {
          handlers.onRoomUpdate(roomData as Room);
        }
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
          const activeClient = getSupabase() || supabase;
          if (!activeClient) return;
          const { data } = await activeClient
            .from('players')
            .select('*')
            .eq('room_id', roomId)
            .order('player_number', { ascending: true });
          if (data) {
            handlers.onPlayersUpdate(data as Player[]);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[NKJxMNT] Supabase Realtime channel status: ${status}`);
        if (status === 'SUBSCRIBED') {
          handlers.onStatusChange('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          handlers.onStatusChange('disconnected');
        }
      });

    return () => {
      const activeClient = getSupabase() || supabase;
      if (activeClient) {
        activeClient.removeChannel(channel);
      }
    };
  }
}
