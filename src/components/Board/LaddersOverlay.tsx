import React from 'react';
import { LADDERS, getTileCoordinates } from '../../game/boardConfig';

export const LaddersOverlay: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Glow for normal white ladders */}
        <filter id="whiteLadderGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ffffff" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ffffff" floodOpacity="0.3" />
        </filter>

        {/* High-intensity multi-glow for Master Ladder #5 */}
        <filter id="masterLadderGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.95" />
          <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#fbbf24" floodOpacity="0.6" />
          <feDropShadow dx="0" dy="0" stdDeviation="22" floodColor="#ec4899" floodOpacity="0.45" />
        </filter>
      </defs>

      {LADDERS.map((ladder) => {
        const startCoord = getTileCoordinates(ladder.from);
        const endCoord = getTileCoordinates(ladder.to);

        const sx = startCoord.x * 10;
        const sy = startCoord.y * 10;
        const ex = endCoord.x * 10;
        const ey = endCoord.y * 10;

        const dx = ex - sx;
        const dy = ey - sy;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const ux = dx / length;
        const uy = dy / length;
        const px = -uy;
        const py = ux;

        const isMaster = Boolean(ladder.isMaster);
        const width = isMaster ? 22 : 16;
        const halfW = width / 2;

        // Stiles coordinates
        const lx1 = sx - px * halfW;
        const ly1 = sy - py * halfW;
        const lx2 = ex - px * halfW;
        const ly2 = ey - py * halfW;

        const rx1 = sx + px * halfW;
        const ry1 = sy + py * halfW;
        const rx2 = ex + px * halfW;
        const ry2 = ey + py * halfW;

        // Rungs count and spacing
        const rungSpacing = isMaster ? 26 : 30;
        const rungCount = Math.max(3, Math.floor(length / rungSpacing));
        const rungs = [];

        for (let i = 1; i <= rungCount; i++) {
          const t = i / (rungCount + 1);
          const cx = sx + dx * t;
          const cy = sy + dy * t;

          const r1x = cx - px * halfW;
          const r1y = cy - py * halfW;
          const r2x = cx + px * halfW;
          const r2y = cy + py * halfW;

          rungs.push({ r1x, r1y, r2x, r2y, cx, cy });
        }

        return (
          <g
            key={`ladder-${ladder.from}-${ladder.to}`}
            filter={isMaster ? 'url(#masterLadderGlowFilter)' : 'url(#whiteLadderGlow)'}
            className={isMaster ? 'master-ladder' : ''}
          >
            {/* Master Ladder aura backdrop */}
            {isMaster && (
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke="#fff7ed"
                strokeWidth={width + 12}
                strokeLinecap="round"
                opacity="0.25"
              />
            )}

            {/* Left and Right Main Stiles (ALL WHITE) */}
            <line
              x1={lx1}
              y1={ly1}
              x2={lx2}
              y2={ly2}
              stroke={isMaster ? '#ffffff' : '#f8fafc'}
              strokeWidth={isMaster ? '4.5' : '3.5'}
              strokeLinecap="round"
            />
            <line
              x1={rx1}
              y1={ry1}
              x2={rx2}
              y2={ry2}
              stroke={isMaster ? '#ffffff' : '#f8fafc'}
              strokeWidth={isMaster ? '4.5' : '3.5'}
              strokeLinecap="round"
            />

            {/* Master Ladder inner stile shine */}
            {isMaster && (
              <>
                <line
                  x1={lx1}
                  y1={ly1}
                  x2={lx2}
                  y2={ly2}
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  strokeDasharray="12 16"
                  opacity="0.8"
                />
                <line
                  x1={rx1}
                  y1={ry1}
                  x2={rx2}
                  y2={ry2}
                  stroke="#fef08a"
                  strokeWidth="1.5"
                  strokeDasharray="12 16"
                  opacity="0.8"
                />
              </>
            )}

            {/* Ladder Rungs */}
            {rungs.map((rung, rIdx) => (
              <g key={`rung-${rIdx}`}>
                <line
                  x1={rung.r1x}
                  y1={rung.r1y}
                  x2={rung.r2x}
                  y2={rung.r2y}
                  stroke={isMaster ? '#ffffff' : '#f1f5f9'}
                  strokeWidth={isMaster ? '3.5' : '2.5'}
                  strokeLinecap="round"
                />
                {/* Special diamond joints on Master Ladder */}
                {isMaster && (
                  <>
                    <circle cx={rung.r1x} cy={rung.r1y} r="2.5" fill="#fef08a" />
                    <circle cx={rung.r2x} cy={rung.r2y} r="2.5" fill="#fef08a" />
                  </>
                )}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
};
