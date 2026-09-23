import type { Player } from '../../types/game';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerStatusProps {
  players: Player[];
  activeTurn: 1 | 2;
  myPlayerNumber: 1 | 2 | null;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  players,
  activeTurn,
  myPlayerNumber,
}) => {
  const p1 = players.find((p) => p.player_number === 1) || {
    name: 'Player 1',
    player_number: 1 as const,
    position: 0,
    connected: true,
  };

  const p2 = players.find((p) => p.player_number === 2) || {
    name: 'Waiting for player...',
    player_number: 2 as const,
    position: 0,
    connected: false,
  };

  const isP1Turn = activeTurn === 1;
  const isP2Turn = activeTurn === 2;

  return (
    <div className="w-full max-w-[500px] mx-auto flex items-center justify-between gap-2 sm:gap-3 py-1 px-1">
      {/* Player 1 Card (Pink Theme 💖) */}
      <motion.div
        animate={{
          scale: isP1Turn ? 1.02 : 0.98,
          borderColor: isP1Turn ? 'rgba(236, 72, 153, 0.8)' : 'rgba(255, 255, 255, 0.08)',
        }}
        className={`flex-1 flex items-center gap-2 sm:gap-3 p-2.5 rounded-xl border backdrop-blur-md transition-all ${
          isP1Turn
            ? 'bg-gradient-to-r from-pink-950/60 via-purple-950/40 to-transparent shadow-[0_0_20px_rgba(236,72,153,0.35)]'
            : 'bg-[#141224]/80 opacity-75'
        }`}
      >
        <div className="relative">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-600 to-rose-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.7)] border-2 border-white/60">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          {isP1Turn && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
              {p1.name}
            </h3>
            {myPlayerNumber === 1 && (
              <span className="text-[9px] font-semibold text-pink-300 bg-pink-500/20 px-1 py-0.2 rounded border border-pink-500/30">
                YOU
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] sm:text-xs text-gray-400">Tile</span>
            <span className="text-xs sm:text-sm font-black text-pink-400">
              {p1.position === 0 ? 'START' : p1.position}
            </span>
          </div>
        </div>
      </motion.div>

      {/* VS Badge */}
      <div className="flex flex-col items-center justify-center px-1">
        <span className="text-[10px] font-black text-pink-400/80 tracking-widest uppercase">
          VS
        </span>
        <div className="w-4 h-0.5 bg-gradient-to-r from-pink-500/60 to-cyan-500/60 rounded-full my-0.5" />
      </div>

      {/* Player 2 Card (Cyan Theme 💎) */}
      <motion.div
        animate={{
          scale: isP2Turn ? 1.02 : 0.98,
          borderColor: isP2Turn ? 'rgba(6, 182, 212, 0.8)' : 'rgba(255, 255, 255, 0.08)',
        }}
        className={`flex-1 flex items-center justify-end text-right gap-2 sm:gap-3 p-2.5 rounded-xl border backdrop-blur-md transition-all ${
          isP2Turn
            ? 'bg-gradient-to-l from-cyan-950/60 via-blue-950/40 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.35)]'
            : 'bg-[#141224]/80 opacity-75'
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-end gap-1.5">
            {myPlayerNumber === 2 && (
              <span className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/20 px-1 py-0.2 rounded border border-cyan-500/30">
                YOU
              </span>
            )}
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[120px]">
              {p2.name}
            </h3>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-[10px] sm:text-xs text-gray-400">Tile</span>
            <span className="text-xs sm:text-sm font-black text-cyan-400">
              {p2.position === 0 ? 'START' : p2.position}
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-sky-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.7)] border-2 border-white/60">
            <Sparkles className="w-4 h-4 fill-white text-white" />
          </div>
          {isP2Turn && (
            <span className="absolute -top-1 -left-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
