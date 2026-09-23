import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/UI/Header';
import { Board } from './components/Board/Board';
import { PlayerStatus } from './components/Game/PlayerStatus';
import { GameControls } from './components/Game/GameControls';
import { Dice3D } from './components/Game/Dice3D';
import { WinModal } from './components/Game/WinModal';
import { ConnectionBadge } from './components/Game/ConnectionBadge';
import { ShareBar } from './components/Room/ShareBar';
import { CreateRoomModal } from './components/Room/CreateRoomModal';
import { JoinRoomModal } from './components/Room/JoinRoomModal';
import { SupabaseConfigModal } from './components/UI/SupabaseConfigModal';
import { LandingView } from './components/UI/LandingView';
import { Toast } from './components/UI/Toast';

import { MultiplayerService } from './services/multiplayerService';
import { calculateMove } from './game/gameLogic';
import { soundManager } from './game/soundManager';
import { isSupabaseConfigured } from './lib/supabase';
import { getSavedSession, clearSavedSession } from './lib/storage';
import type {
  Player,
  PlayerNumber,
  Room,
  GameEventPayload,
  ToastMessage,
  ConnectionStatus,
  MoveStep,
} from './types/game';

export const App: React.FC = () => {
  // Navigation & Room state
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerNumber, setMyPlayerNumber] = useState<PlayerNumber | null>(null);

  // Connection & UI modals
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isSupabaseConfigured() ? 'connecting' : 'demo'
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitedRoomCode, setInvitedRoomCode] = useState<string>('');
  const [creatorName, setCreatorName] = useState<string>('');

  // Active game state
  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isFiveCelebration, setIsFiveCelebration] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isWinModalOpen, setIsWinModalOpen] = useState<boolean>(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (text: string, type: ToastMessage['type'] = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    const id = Date.now().toString();
    setToast({ id, text, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Check URL parameters on mount (?room=XXXX or /game/XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let codeFromUrl = params.get('room');

    if (!codeFromUrl && window.location.pathname.startsWith('/game/')) {
      codeFromUrl = window.location.pathname.split('/game/')[1]?.split('/')[0];
    }

    if (codeFromUrl) {
      const code = codeFromUrl.trim().toUpperCase();
      setInvitedRoomCode(code);

      // Check if user already has saved session for this room
      const saved = getSavedSession(code);
      if (saved) {
        // Attempt auto-reconnect
        handleAutoReconnect(code, saved.playerNumber);
      } else {
        // Always open join modal so user sees the prompt immediately
        setIsJoinOpen(true);
        MultiplayerService.getRoomDetails(code)
          .then(({ room, players }) => {
            if (room) {
              const p1 = players.find((p) => p.player_number === 1);
              if (p1) setCreatorName(p1.name);
            } else {
              showToast(`Room "${code}" was not found in Supabase. Please verify the code.`, 'info', 5000);
            }
          })
          .catch((err: unknown) => {
            console.error('[NKJxMNT] Error loading room details on mount:', err);
            const msg = err instanceof Error ? err.message : 'Database error';
            showToast(`Could not load room "${code}": ${msg}`, 'info', 5000);
          });
      }
    }
  }, []);

  const handleAutoReconnect = async (code: string, playerNum: PlayerNumber) => {
    try {
      setIsLoading(true);
      const { room: existingRoom, players: existingPlayers } = await MultiplayerService.getRoomDetails(code);
      if (existingRoom) {
        setRoom(existingRoom);
        setPlayers(existingPlayers);
        setMyPlayerNumber(playerNum);
        setupRoomSubscription(existingRoom.id);
      }
    } catch (err) {
      console.error('Failed to auto-reconnect', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates for a room
  const setupRoomSubscription = useCallback((roomId: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const unsub = MultiplayerService.subscribeToRoom(roomId, {
      onRoomUpdate: (updatedRoom) => {
        setRoom(updatedRoom);
        if (updatedRoom.status === 'finished' && updatedRoom.winner_name) {
          setIsWinModalOpen(true);
        }
      },
      onPlayersUpdate: (updatedPlayers) => {
        setPlayers(updatedPlayers);
      },
      onGameEvent: (event) => {
        handleRemoteGameEvent(event);
      },
      onStatusChange: (status) => {
        setConnectionStatus(isSupabaseConfigured() ? status : 'demo');
      },
    });

    unsubscribeRef.current = unsub;
  }, []);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Handle incoming remote game event (from the other player)
  const handleRemoteGameEvent = async (event: GameEventPayload) => {
    if (event.type === 'ROLL_DICE' && event.dice_value && event.steps) {
      // If it's NOT our own roll, animate the remote player's move!
      setIsRolling(true);
      setDiceValue(event.dice_value);
      soundManager.playDiceRoll();

      // Wait for dice roll animation
      await new Promise((resolve) => setTimeout(resolve, 1100));
      setIsRolling(false);

      // Special 5 Easter Egg Celebration on Remote Roll
      if (event.dice_value === 5) {
        soundManager.playSpecialFiveChime();
        showToast("✨ 💗 FIVE! Her Special Number! 💗 ✨", "ladder", 2200);
      }

      // Play step-by-step remote moves
      await executeMoveSteps(event.player_number, event.steps);
    } else if (event.type === 'RESTART_GAME') {
      setIsWinModalOpen(false);
      showToast('Game restarted! Have fun!', 'info');
    }
  };

  // Animate step-by-step hops and snake/ladder actions
  const executeMoveSteps = async (playerNumber: PlayerNumber, steps: MoveStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Update player position locally for instant visual feedback
      setPlayers((prev) =>
        prev.map((p) => (p.player_number === playerNumber ? { ...p, position: step.position } : p))
      );

      if (step.type === 'step') {
        soundManager.playStep(i);

        // Check if landed on special Tile 5!
        if (step.position === 5) {
          setIsFiveCelebration(true);
          soundManager.playSpecialFiveChime();
          showToast("✨ Landed on 5! Special Birthday Tile! 💗 ✨", "ladder", 2400);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setIsFiveCelebration(false);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 220));
        }
      } else if (step.type === 'ladder') {
        const isMaster = step.position === 58;
        soundManager.playLadder(isMaster);
        showToast(
          isMaster ? '⭐ Lucky Tile 5! Master Ladder Climb!' : '🪜 Climb!',
          'ladder',
          3500
        );
        await new Promise((resolve) => setTimeout(resolve, 600));
      } else if (step.type === 'snake') {
        soundManager.playSnake();
        showToast('🐍 Snake! Down you go!', 'snake', 3500);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  };

  // Create room handler
  const handleCreateRoom = async (name: string) => {
    setIsLoading(true);
    try {
      const { room: newRoom, player: newPlayer } = await MultiplayerService.createRoom(name);
      setRoom(newRoom);
      setPlayers([newPlayer]);
      setMyPlayerNumber(1);
      setIsCreateOpen(false);

      // Update URL without reload
      window.history.pushState({}, '', `?room=${newRoom.room_code}`);
      setupRoomSubscription(newRoom.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      console.error('[NKJxMNT] handleCreateRoom error:', err);
      showToast(msg, 'info', 6000);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Join room handler
  const handleJoinRoom = async (code: string, name: string) => {
    setIsLoading(true);
    try {
      const { room: joinedRoom, player: joinedPlayer } = await MultiplayerService.joinRoom(code, name);
      setRoom(joinedRoom);
      setMyPlayerNumber(joinedPlayer.player_number);
      setIsJoinOpen(false);

      // Refresh players
      const { players: currentPlayers } = await MultiplayerService.getRoomDetails(code);
      setPlayers(currentPlayers);

      window.history.pushState({}, '', `?room=${joinedRoom.room_code}`);
      setupRoomSubscription(joinedRoom.id);
      showToast(`${name} joined the game!`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      console.error('[NKJxMNT] handleJoinRoom error:', err);
      showToast(msg, 'info', 6000);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Roll dice action
  const handleRollDice = async () => {
    if (!room || !myPlayerNumber || isRolling) return;
    if (room.current_turn !== myPlayerNumber) return;

    const myPlayer = players.find((p) => p.player_number === myPlayerNumber);
    if (!myPlayer) return;

    // Check if second player has joined
    if (players.length < 2) {
      showToast('Invite your friend to join before rolling! 🎲', 'info');
      return;
    }

    // 1. Generate random roll (1-6)
    const roll = Math.floor(Math.random() * 6) + 1;
    setIsRolling(true);
    setDiceValue(roll);
    soundManager.playDiceRoll();

    // 2. Calculate authoritative move
    const result = calculateMove(myPlayer.position, roll, myPlayerNumber);

    // 3. Broadcast roll immediately to opponent so their 3D dice rolls in sync
    await MultiplayerService.broadcastDiceRoll(room.id, myPlayerNumber, roll, result.steps);

    // 4. Wait for 3D dice animation to settle
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setIsRolling(false);

    // Special 5 Easter Egg Celebration on Local Roll
    if (roll === 5) {
      soundManager.playSpecialFiveChime();
      showToast("✨ 💗 FIVE! Her Special Number! 💗 ✨", "ladder", 2200);
    }

    // If overshoot, cannot move
    if (!result.canMove) {
      showToast(result.message || 'Overshot! Need exact roll to reach 100!', 'info');
      await MultiplayerService.commitMove(room.id, myPlayerNumber, myPlayer.position, result.nextTurn);
      return;
    }

    // 5. Execute hopping animation step-by-step
    await executeMoveSteps(myPlayerNumber, result.steps);

    // 6. Handle victory or switch turn
    const winnerName = result.isWin ? myPlayer.name : null;
    await MultiplayerService.commitMove(
      room.id,
      myPlayerNumber,
      result.finalPosition,
      result.nextTurn,
      winnerName
    );

    if (result.isWin) {
      setIsWinModalOpen(true);
    }
  };

  // Restart / Play Again
  const handlePlayAgain = async () => {
    if (!room) return;
    setIsWinModalOpen(false);
    await MultiplayerService.resetGame(room.id);
  };

  // Return to landing home
  const handleReturnHome = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    clearSavedSession();
    setRoom(null);
    setPlayers([]);
    setMyPlayerNumber(null);
    setIsWinModalOpen(false);
    window.history.pushState({}, '', '/');
  };

  const activePlayer = players.find((p) => p.player_number === (room?.current_turn || 1));
  const activePlayerName = activePlayer?.name || (room?.current_turn === 1 ? 'Player 1' : 'Player 2');
  const isMyTurn = Boolean(room && myPlayerNumber && room.current_turn === myPlayerNumber);
  const waitingForSecondPlayer = Boolean(room && players.length < 2);

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Top Bar with Connection health badge & Header */}
      <div>
        <div className="w-full flex items-center justify-between px-2 pt-1 pb-1">
          <ConnectionBadge
            status={connectionStatus}
            onOpenSettings={() => setIsConfigOpen(true)}
          />

          {room && (
            <button
              onClick={handleReturnHome}
              className="text-[11px] font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 transition-colors"
            >
              Exit Room
            </button>
          )}
        </div>

        <Header />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center my-1">
        {room ? (
          <div className="w-full space-y-2">
            {/* Share & Invite controls */}
            <ShareBar roomCode={room.room_code} />

            {/* Players VS Status bar */}
            <PlayerStatus
              players={players}
              activeTurn={room.current_turn}
              myPlayerNumber={myPlayerNumber}
            />

            {/* The 10x10 Snake & Ladder Board */}
            <Board
              players={players}
              activePlayerNumber={room.current_turn}
              isFiveCelebration={isFiveCelebration}
            />

            {/* Interactive 3D Dice */}
            <div className="py-1">
              <Dice3D
                value={diceValue}
                isRolling={isRolling}
                disabled={!isMyTurn || waitingForSecondPlayer}
                onClick={handleRollDice}
                showFiveCelebration={diceValue === 5 && !isRolling}
              />
            </div>

            {/* Game Controls & Roll Button */}
            <GameControls
              isMyTurn={isMyTurn}
              isRolling={isRolling}
              activePlayerName={activePlayerName}
              waitingForSecondPlayer={waitingForSecondPlayer}
              onRoll={handleRollDice}
            />
          </div>
        ) : (
          <LandingView
            onCreateClick={() => setIsCreateOpen(true)}
            onJoinClick={() => {
              setInvitedRoomCode('');
              setIsJoinOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-2 text-[10px] text-gray-500 select-none">
        <span>NKJxMNT KAUR 🎲 • A real online multiplayer game</span>
      </footer>

      {/* Floating Alerts & Toast */}
      <Toast toast={toast} />

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
        isLoading={isLoading}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinRoom}
        initialRoomCode={invitedRoomCode}
        creatorName={creatorName}
        isLoading={isLoading}
      />

      <WinModal
        isOpen={isWinModalOpen}
        winnerName={room?.winner_name || (myPlayerNumber === 1 ? 'NKJ' : 'MNT')}
        isMyWin={Boolean(
          room?.winner_name &&
            players.find((p) => p.player_number === myPlayerNumber)?.name === room.winner_name
        )}
        onPlayAgain={handlePlayAgain}
        onReturnToHome={handleReturnHome}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default App;
