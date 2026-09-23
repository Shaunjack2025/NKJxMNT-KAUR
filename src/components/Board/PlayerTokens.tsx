import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../../types/game';
import { getTileCoordinates } from '../../game/boardConfig';
import { Heart, Sparkles } from 'lucide-react';

interface PlayerTokensProps {
  players: Player[];
  activePlayerNumber: 1 | 2;
}

export const PlayerTokens: React.FC<PlayerTokensProps> = ({ players, activePlayerNumber }) => {
  const p1 = players.find((p) => p.player_number === 1);
  const p2 = players.find((p) => p.player_number === 2);

  const isSameTile = Boolean(p1 && p2 && p1.position > 0 && p1.position === p2.position);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Player 1 Token (Pink Themed 💖) */}
      {p1 && (
        <TokenItem
          player={p1}
          isActive={activePlayerNumber === 1}
          offset={isSameTile ? -14 : 0}
          colorTheme="pink"
        />
      )}

      {/* Player 2 Token (Electric Cyan Themed 💎) */}
      {p2 && (
        <TokenItem
          player={p2}
          isActive={activePlayerNumber === 2}
          offset={isSameTile ? 14 : 0}
          colorTheme="cyan"
        />
      )}
    </div>
  );
};

interface TokenItemProps {
  player: Player;
  isActive: boolean;
  offset: number;
  colorTheme: 'pink' | 'cyan';
}

const TokenItem: React.FC<TokenItemProps> = ({ player, isActive, offset, colorTheme }) => {
  const isOffBoard = player.position <= 0;
  // If off-board, position at the bottom of the board
  const coords = isOffBoard
    ? { x: player.player_number === 1 ? 25 : 75, y: 106 }
    : getTileCoordinates(player.position);

  const isPink = colorTheme === 'pink';

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${coords.x}%`,
        top: `${coords.y}%`,
      }}
      animate={{
        left: `${coords.x}%`,
        top: `${coords.y}%`,
        x: offset,
      }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 24,
      }}
    >
      {/* Turn indicator halo if it's this player's turn */}
      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className={`absolute w-10 h-10 rounded-full ${
            isPink ? 'bg-pink-500/40 ring-2 ring-pink-400' : 'bg-cyan-500/40 ring-2 ring-cyan-400'
          }`}
        />
      )}

      {/* Main 3D Token Disk */}
      <motion.div
        whileHover={{ scale: 1.15 }}
        className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg select-none border-2 ${
          isPink
            ? 'bg-gradient-to-tr from-pink-600 via-pink-500 to-rose-400 border-white text-white shadow-[0_0_15px_rgba(236,72,153,0.9)]'
            : 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-300 border-white text-white shadow-[0_0_15px_rgba(6,182,212,0.9)]'
        }`}
      >
        {/* Token Inner Icon */}
        {isPink ? (
          <Heart className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
        )}

        {/* Player Initial Badge */}
        <span className="sr-only">{player.name}</span>
      </motion.div>

      {/* Floating Name Label */}
      <div
        className={`mt-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold rounded-full shadow-md whitespace-nowrap border backdrop-blur-md ${
          isPink
            ? 'bg-pink-950/80 text-pink-200 border-pink-500/40'
            : 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40'
        }`}
      >
        {player.name || `P${player.player_number}`}
      </div>
    </motion.div>
  );
};
