import {
  getFirebaseDatabase,
  isFirebaseConfigured,
  testFirebaseConnection,
  logFirebaseDiagnostics,
  firebaseDatabaseUrl,
  firebaseProjectId,
  ref,
  get,
  set,
  update,
  onValue,
  off,
  onDisconnect,
} from '../lib/firebase';
import type {
  Player,
  PlayerNumber,
  Room,
  RoomStatus,
  GameEventPayload,
  MoveStep,
} from '../types/game';
import { savePlayerSession, getSavedSession } from '../lib/storage';

export interface FirebasePlayerState {
  name: string;
  position: number;
  connected: boolean;
  sessionToken?: string;
  updatedAt?: number;
}

export interface FirebaseLastEvent {
  id: string;
  type: 'ROLL_DICE' | 'RESTART_GAME' | 'PLAYER_JOINED';
  playerNumber?: PlayerNumber;
  diceValue?: number;
  steps?: MoveStep[];
  timestamp: number;
}

export interface FirebaseRoomState {
  roomCode?: string;
  status: RoomStatus;
  currentTurn: PlayerNumber;
  winner: string | null;
  players?: {
    player1?: FirebasePlayerState;
    player2?: FirebasePlayerState;
  };
  lastEvent?: FirebaseLastEvent;
  createdAt: number;
  updatedAt: number;
}

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

// Convert RTDB room format to application Room type
function formatRoom(roomCode: string, data: FirebaseRoomState): Room {
  const createdAtIso = typeof data.createdAt === 'number'
    ? new Date(data.createdAt).toISOString()
    : new Date().toISOString();
  const updatedAtIso = typeof data.updatedAt === 'number'
    ? new Date(data.updatedAt).toISOString()
    : new Date().toISOString();

  return {
    id: roomCode,
    room_code: roomCode,
    status: data.status || 'waiting',
    current_turn: (data.currentTurn as PlayerNumber) || 1,
    winner_id: null,
    winner_name: data.winner || null,
    created_at: createdAtIso,
    updated_at: updatedAtIso,
  };
}

// Convert RTDB players format to application Player[] list
function formatPlayers(roomCode: string, data: FirebaseRoomState): Player[] {
  const players: Player[] = [];

  if (data.players?.player1) {
    players.push({
      id: `${roomCode}_1`,
      room_id: roomCode,
      name: data.players.player1.name || 'Player 1',
      player_number: 1,
      position: typeof data.players.player1.position === 'number' ? data.players.player1.position : 0,
      session_token: data.players.player1.sessionToken || '',
      connected: Boolean(data.players.player1.connected),
      updated_at: data.players.player1.updatedAt
        ? new Date(data.players.player1.updatedAt).toISOString()
        : undefined,
    });
  }

  if (data.players?.player2) {
    players.push({
      id: `${roomCode}_2`,
      room_id: roomCode,
      name: data.players.player2.name || 'Player 2',
      player_number: 2,
      position: typeof data.players.player2.position === 'number' ? data.players.player2.position : 0,
      session_token: data.players.player2.sessionToken || '',
      connected: Boolean(data.players.player2.connected),
      updated_at: data.players.player2.updatedAt
        ? new Date(data.players.player2.updatedAt).toISOString()
        : undefined,
    });
  }

  return players;
}

// Keep track of locally initiated event IDs so we don't trigger self-animations
const localProcessedEventIds = new Set<string>();

export class MultiplayerService {
  /**
   * Health check for Firebase Realtime Database connection status
   */
  static async checkConnection(): Promise<{
    ok: boolean;
    latencyMs: number;
    error?: string;
  }> {
    const result = await testFirebaseConnection();
    return {
      ok: result.ok,
      latencyMs: result.latencyMs,
      error: result.error,
    };
  }

  /**
   * Setup player presence (online / offline) with onDisconnect hook
   */
  private static setupPresence(
    roomCode: string,
    playerNumber: PlayerNumber
  ): () => void {
    const db = getFirebaseDatabase();
    if (!db) return () => {};

    const playerConnectedRef = ref(db, `rooms/${roomCode}/players/player${playerNumber}/connected`);
    const connectedRef = ref(db, '.info/connected');

    const handleConnectedChange = (snap: { val: () => any }) => {
      if (snap.val() === true) {
        set(playerConnectedRef, true);
        onDisconnect(playerConnectedRef).set(false);
      }
    };

    onValue(connectedRef, handleConnectedChange);

    return () => {
      off(connectedRef, 'value', handleConnectedChange);
    };
  }

  /**
   * Create a new room with Player 1 in Firebase Realtime Database
   */
  static async createRoom(creatorName: string): Promise<{ room: Room; player: Player }> {
    console.log('[NKJxMNT] ========================================');
    console.log('[NKJxMNT] FIREBASE CREATE ROOM START');
    console.log('[NKJxMNT] Creator Name:', creatorName);
    console.log('[NKJxMNT] Target Database URL:', firebaseDatabaseUrl);
    console.log('[NKJxMNT] Target Project ID:', firebaseProjectId);

    if (!isFirebaseConfigured()) {
      logFirebaseDiagnostics();
      console.error('[NKJxMNT] Cannot create room: Firebase environment variables are missing.');
      throw new Error(
        `Firebase Realtime Database is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_DATABASE_URL are configured.`
      );
    }

    const db = getFirebaseDatabase();
    if (!db) {
      logFirebaseDiagnostics();
      throw new Error('Failed to initialize Firebase Realtime Database. Check browser console for details.');
    }

    // Generate unique 6-character room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      const existingSnap = await get(ref(db, `rooms/${roomCode}`));
      if (!existingSnap.exists()) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    const sessionToken = generateSessionToken();
    const now = Date.now();

    const initialRoomData: FirebaseRoomState = {
      roomCode,
      status: 'waiting',
      currentTurn: 1,
      winner: null,
      players: {
        player1: {
          name: creatorName.trim(),
          position: 0,
          connected: true,
          sessionToken,
          updatedAt: now,
        },
      },
      createdAt: now,
      updatedAt: now,
    };

    try {
      console.log(`[NKJxMNT] Writing room ${roomCode} to Firebase RTDB path: rooms/${roomCode}`);
      await set(ref(db, `rooms/${roomCode}`), initialRoomData);
    } catch (err: unknown) {
      console.error('[NKJxMNT] Failed to write room to Firebase RTDB:', err);
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to create room in Firebase Realtime Database: ${msg}`);
    }

    // Attach presence listener for Player 1
    MultiplayerService.setupPresence(roomCode, 1);

    // Save session in localStorage for reconnects
    savePlayerSession({
      roomCode,
      roomId: roomCode,
      playerNumber: 1,
      playerName: creatorName.trim(),
      sessionToken,
    });

    const room = formatRoom(roomCode, initialRoomData);
    const players = formatPlayers(roomCode, initialRoomData);
    const player = players.find((p) => p.player_number === 1)!;

    console.log('[NKJxMNT] Firebase room created successfully:', roomCode);
    console.log('[NKJxMNT] ========================================');

    return { room, player };
  }

  /**
   * Join an existing room in Firebase Realtime Database
   */
  static async joinRoom(roomCode: string, playerName: string): Promise<{ room: Room; player: Player }> {
    const formattedCode = roomCode.trim().toUpperCase();

    console.log('[NKJxMNT] ========================================');
    console.log('[NKJxMNT] FIREBASE JOIN ROOM START');
    console.log('[NKJxMNT] Joining Room Code:', formattedCode);
    console.log('[NKJxMNT] Player Name:', playerName);

    if (!isFirebaseConfigured()) {
      logFirebaseDiagnostics();
      throw new Error(
        `Firebase Realtime Database is not configured. Please ensure VITE_FIREBASE_API_KEY and VITE_FIREBASE_DATABASE_URL are configured.`
      );
    }

    const db = getFirebaseDatabase();
    if (!db) {
      throw new Error('Failed to initialize Firebase Realtime Database.');
    }

    const roomRef = ref(db, `rooms/${formattedCode}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      console.warn(`[NKJxMNT] Room "${formattedCode}" does not exist in Firebase RTDB.`);
      throw new Error(`Room "${formattedCode}" not found. Please verify the 6-character code.`);
    }

    const roomData = snapshot.val() as FirebaseRoomState;
    const existingPlayers = formatPlayers(formattedCode, roomData);
    const saved = getSavedSession(formattedCode);

    // 1. Reconnect if session matches existing player
    if (saved) {
      const found = existingPlayers.find(
        (p) => p.session_token === saved.sessionToken || p.player_number === saved.playerNumber
      );
      if (found) {
        console.log(`[NKJxMNT] Reconnecting player ${found.name} (Player ${found.player_number})`);
        MultiplayerService.setupPresence(formattedCode, found.player_number);
        return { room: formatRoom(formattedCode, roomData), player: found };
      }
    }

    // 2. Check if player 2 slot is available
    if (roomData.players?.player2) {
      throw new Error('This game room is already full (both players have joined).');
    }

    const sessionToken = generateSessionToken();
    const now = Date.now();
    const joinEventId = `join_${now}_${Math.random().toString(36).substring(2, 6)}`;
    localProcessedEventIds.add(joinEventId);

    const updates: Record<string, any> = {
      'players/player2': {
        name: playerName.trim(),
        position: 0,
        connected: true,
        sessionToken,
        updatedAt: now,
      },
      status: 'playing',
      updatedAt: now,
      lastEvent: {
        id: joinEventId,
        type: 'PLAYER_JOINED',
        timestamp: now,
      },
    };

    try {
      await update(roomRef, updates);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[NKJxMNT] Error updating room with Player 2:', err);
      throw new Error(`Failed to join room in Firebase: ${msg}`);
    }

    // Attach presence for Player 2
    MultiplayerService.setupPresence(formattedCode, 2);

    savePlayerSession({
      roomCode: formattedCode,
      roomId: formattedCode,
      playerNumber: 2,
      playerName: playerName.trim(),
      sessionToken,
    });

    // Re-fetch updated snapshot
    const updatedSnap = await get(roomRef);
    const updatedData = (updatedSnap.val() || roomData) as FirebaseRoomState;
    const players = formatPlayers(formattedCode, updatedData);
    const player = players.find((p) => p.player_number === 2)!;

    console.log('[NKJxMNT] Joined room successfully as Player 2:', playerName);
    console.log('[NKJxMNT] ========================================');

    return { room: formatRoom(formattedCode, updatedData), player };
  }

  /**
   * Fetch current room and player state from Firebase Realtime Database
   */
  static async getRoomDetails(roomCode: string): Promise<{ room: Room | null; players: Player[] }> {
    if (!isFirebaseConfigured()) {
      return { room: null, players: [] };
    }

    const db = getFirebaseDatabase();
    if (!db) {
      return { room: null, players: [] };
    }

    const formattedCode = roomCode.trim().toUpperCase();
    try {
      const snap = await get(ref(db, `rooms/${formattedCode}`));
      if (!snap.exists()) {
        return { room: null, players: [] };
      }

      const data = snap.val() as FirebaseRoomState;
      return {
        room: formatRoom(formattedCode, data),
        players: formatPlayers(formattedCode, data),
      };
    } catch (err) {
      console.error(`[NKJxMNT] Error querying room "${formattedCode}" from Firebase:`, err);
      return { room: null, players: [] };
    }
  }

  /**
   * Broadcast dice roll event immediately to room path in Firebase RTDB
   */
  static async broadcastDiceRoll(
    roomId: string,
    playerNumber: PlayerNumber,
    diceValue: number,
    steps: MoveStep[]
  ): Promise<void> {
    const db = getFirebaseDatabase();
    if (!db) return;

    const eventId = `roll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localProcessedEventIds.add(eventId);

    const payload: FirebaseLastEvent = {
      id: eventId,
      type: 'ROLL_DICE',
      playerNumber,
      diceValue,
      steps,
      timestamp: Date.now(),
    };

    try {
      await update(ref(db, `rooms/${roomId}`), {
        lastEvent: payload,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error('[NKJxMNT] Error broadcasting dice roll to Firebase:', err);
    }
  }

  /**
   * Commit authoritative move result to Firebase Realtime Database
   */
  static async commitMove(
    roomId: string,
    playerNumber: PlayerNumber,
    newPosition: number,
    nextTurn: PlayerNumber,
    winnerName: string | null = null
  ): Promise<void> {
    const db = getFirebaseDatabase();
    if (!db) return;

    const status: RoomStatus = winnerName ? 'finished' : 'playing';
    const now = Date.now();

    const updates: Record<string, any> = {
      [`players/player${playerNumber}/position`]: newPosition,
      [`players/player${playerNumber}/updatedAt`]: now,
      currentTurn: nextTurn,
      winner: winnerName || null,
      status,
      updatedAt: now,
    };

    try {
      await update(ref(db, `rooms/${roomId}`), updates);
    } catch (err) {
      console.error('[NKJxMNT] Error committing move to Firebase:', err);
    }
  }

  /**
   * Reset game to play again in Firebase Realtime Database
   */
  static async resetGame(roomId: string): Promise<void> {
    const db = getFirebaseDatabase();
    if (!db) return;

    const now = Date.now();
    const eventId = `restart_${now}_${Math.random().toString(36).substring(2, 6)}`;
    localProcessedEventIds.add(eventId);

    const updates: Record<string, any> = {
      'players/player1/position': 0,
      'players/player1/updatedAt': now,
      status: 'playing',
      currentTurn: 1,
      winner: null,
      lastEvent: {
        id: eventId,
        type: 'RESTART_GAME',
        timestamp: now,
      },
      updatedAt: now,
    };

    // If player 2 exists, also reset player 2's position
    const snap = await get(ref(db, `rooms/${roomId}/players/player2`));
    if (snap.exists()) {
      updates['players/player2/position'] = 0;
      updates['players/player2/updatedAt'] = now;
    }

    try {
      await update(ref(db, `rooms/${roomId}`), updates);
    } catch (err) {
      console.error('[NKJxMNT] Error resetting game in Firebase:', err);
    }
  }

  /**
   * Subscribe to real-time updates for a room using Firebase Realtime Database listeners
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
    if (!isFirebaseConfigured()) {
      handlers.onStatusChange('disconnected');
      console.warn('[NKJxMNT] subscribeToRoom called without Firebase configuration.');
      return () => {};
    }

    const db = getFirebaseDatabase();
    if (!db) {
      handlers.onStatusChange('disconnected');
      return () => {};
    }

    handlers.onStatusChange('connecting');

    const roomRef = ref(db, `rooms/${roomId}`);
    const connectedRef = ref(db, '.info/connected');
    const processedEventsInSession = new Set<string>();

    // Listen to Firebase Realtime Database connection status
    const handleConnectedChange = (snap: { val: () => any }) => {
      const isConnected = snap.val() === true;
      handlers.onStatusChange(isConnected ? 'connected' : 'disconnected');
    };
    onValue(connectedRef, handleConnectedChange);

    // Listen to room value changes in real time
    const handleRoomChange = (snap: { exists: () => boolean; val: () => FirebaseRoomState }) => {
      if (!snap.exists()) {
        handlers.onStatusChange('disconnected');
        return;
      }

      handlers.onStatusChange('connected');
      const data = snap.val();

      const formattedRoom = formatRoom(roomId, data);
      const formattedPlayersList = formatPlayers(roomId, data);

      handlers.onRoomUpdate(formattedRoom);
      handlers.onPlayersUpdate(formattedPlayersList);

      // Check lastEvent for real-time dice rolls, hops, or game restart
      if (data.lastEvent && data.lastEvent.id) {
        const eventId = data.lastEvent.id;
        if (!processedEventsInSession.has(eventId) && !localProcessedEventIds.has(eventId)) {
          processedEventsInSession.add(eventId);

          if (data.lastEvent.type === 'ROLL_DICE' && data.lastEvent.playerNumber && data.lastEvent.diceValue) {
            const payload: GameEventPayload = {
              type: 'ROLL_DICE',
              room_id: roomId,
              player_number: data.lastEvent.playerNumber,
              dice_value: data.lastEvent.diceValue,
              steps: data.lastEvent.steps,
              timestamp: data.lastEvent.timestamp,
            };
            handlers.onGameEvent(payload);
          } else if (data.lastEvent.type === 'RESTART_GAME') {
            const payload: GameEventPayload = {
              type: 'RESTART_GAME',
              room_id: roomId,
              player_number: 1,
              timestamp: data.lastEvent.timestamp,
            };
            handlers.onGameEvent(payload);
          }
        }
      }
    };

    onValue(roomRef, handleRoomChange);

    // Return cleanup callback
    return () => {
      off(roomRef, 'value', handleRoomChange);
      off(connectedRef, 'value', handleConnectedChange);
    };
  }
}
