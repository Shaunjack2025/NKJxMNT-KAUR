import React, { useState } from 'react';
import { Volume2, VolumeX, Dices } from 'lucide-react';
import { soundManager } from '../../game/soundManager';
import { motion } from 'framer-motion';

interface GameControlsProps {
  isMyTurn: boolean;
  isRolling: boolean;
  activePlayerName: string;
  onRoll: () => void;
  waitingForSecondPlayer?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isMyTurn,
  isRolling,
  activePlayerName,
  onRoll,
  waitingForSecondPlayer = false,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto flex flex-col items-center gap-3 pt-2">
      {/* Turn Status Message */}
      <div className="text-center min-h-[24px]">
        {waitingForSecondPlayer ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Waiting for second player to join...
          </div>
        ) : isMyTurn ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/50 text-pink-300 text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(236,72,153,0.3)]">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            YOUR TURN 🎲
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs sm:text-sm font-medium">
            Waiting for {activePlayerName || 'player'}...
          </div>
        )}
      </div>

      {/* Main Roll Action Button and Controls Bar */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Sound toggle button */}
        <button
          onClick={handleToggleSound}
          className="p-3 rounded-xl bg-[#141224] border border-white/10 text-gray-300 hover:text-white hover:border-pink-500/40 hover:bg-[#1a1730] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-pink-400" />
          )}
        </button>

        {/* Primary Roll Button */}
        <motion.button
          whileHover={isMyTurn && !isRolling && !waitingForSecondPlayer ? { scale: 1.02 } : {}}
          whileTap={isMyTurn && !isRolling && !waitingForSecondPlayer ? { scale: 0.98 } : {}}
          disabled={!isMyTurn || isRolling || waitingForSecondPlayer}
          onClick={onRoll}
          className={`flex-1 py-3.5 px-6 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-lg ${
            isMyTurn && !isRolling && !waitingForSecondPlayer
              ? 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-[0_0_25px_rgba(236,72,153,0.6)] border border-pink-300/40 cursor-pointer'
              : 'bg-[#181628] border border-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>
            {waitingForSecondPlayer
              ? 'WAITING FOR PLAYER...'
              : isRolling
              ? 'ROLLING...'
              : isMyTurn
              ? 'ROLL DICE 🎲'
              : `${activePlayerName.toUpperCase()}'S TURN`}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
