import type { ConnectionStatus } from '../../types/game';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  onOpenSettings?: () => void;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ status, onOpenSettings }) => {
  return (
    <button
      onClick={onOpenSettings}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141224]/80 border border-white/10 hover:border-pink-500/30 text-[10px] font-medium backdrop-blur-md transition-all select-none cursor-pointer"
      title="Click to view backend connection details"
    >
      {status === 'connected' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
          <span className="text-emerald-300">Connected</span>
        </>
      )}

      {status === 'connecting' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-ping" />
          <span className="text-amber-300">Connecting...</span>
        </>
      )}

      {status === 'disconnected' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
          <span className="text-rose-400">Reconnecting...</span>
        </>
      )}

      {status === 'demo' && (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]" />
          <span className="text-sky-300">Local Multi-Tab</span>
        </>
      )}
    </button>
  );
};
