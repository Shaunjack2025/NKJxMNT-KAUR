import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareBarProps {
  roomCode: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({ roomCode }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/game/${roomCode}`;
    }
    return '';
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback prompt
      window.prompt('Copy invite link:', url);
    }
  };

  const handleWebShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NKJxMNT KAUR 🎲',
          text: "Play our little Snake & Ladder game with me!",
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto flex items-center justify-between gap-2 p-2 rounded-xl bg-[#131124]/90 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-2 pl-2">
        <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Room
        </span>
        <span className="font-mono text-xs sm:text-sm font-black text-pink-400 tracking-wider">
          {roomCode}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1d1a33] hover:bg-pink-600/20 text-gray-200 hover:text-pink-300 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>COPY LINK</span>
            </>
          )}
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleWebShare}
            className="p-1.5 rounded-lg text-xs font-bold bg-[#1d1a33] hover:bg-pink-600/20 text-gray-200 hover:text-pink-300 border border-white/10 hover:border-pink-500/40 transition-all cursor-pointer active:scale-95"
            title="Share with partner"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
