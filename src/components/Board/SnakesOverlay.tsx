import React from 'react';
import { SNAKES, getTileCoordinates } from '../../game/boardConfig';

export const SnakesOverlay: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Pink Snake Glow Filters */}
        <filter id="pinkSnakeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ec4899" floodOpacity="0.75" />
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f43f5e" floodOpacity="0.45" />
        </filter>

        {/* Dynamic Snake Gradients */}
        <linearGradient id="snakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>

        <linearGradient id="snakeGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="60%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>

        {/* Head Gradient */}
        <radialGradient id="snakeHeadGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="50%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be185d" />
        </radialGradient>
      </defs>

      {SNAKES.map((snake, index) => {
        const headCoord = getTileCoordinates(snake.from);
        const tailCoord = getTileCoordinates(snake.to);

        const hx = headCoord.x * 10;
        const hy = headCoord.y * 10;
        const tx = tailCoord.x * 10;
        const ty = tailCoord.y * 10;

        // Compute curved snake body with natural serpentine curve
        const dx = tx - hx;
        const dy = ty - hy;
        const length = Math.sqrt(dx * dx + dy * dy);

        // Perpendicular offset for wave
        const nx = -dy / length;
        const ny = dx / length;
        const bendOffset = (index % 2 === 0 ? 1 : -1) * Math.min(length * 0.22, 60);

        // Control points for S-curve slither
        const cp1x = hx + dx * 0.3 + nx * bendOffset;
        const cp1y = hy + dy * 0.3 + ny * bendOffset;
        const cp2x = hx + dx * 0.7 - nx * bendOffset * 0.8;
        const cp2y = hy + dy * 0.7 - ny * bendOffset * 0.8;

        const pathData = `M ${hx} ${hy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tx} ${ty}`;

        // Angle for head rotation
        const angle = (Math.atan2(cp1y - hy, cp1x - hx) * 180) / Math.PI;

        return (
          <g key={`snake-${snake.from}-${snake.to}`} filter="url(#pinkSnakeGlow)">
            {/* Outer soft glow stroke */}
            <path
              d={pathData}
              fill="none"
              stroke="#ec4899"
              strokeWidth="18"
              strokeLinecap="round"
              opacity="0.35"
            />

            {/* Main pink curved body */}
            <path
              d={pathData}
              fill="none"
              stroke={index % 2 === 0 ? 'url(#snakeGrad1)' : 'url(#snakeGrad2)'}
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Inner scale highlight */}
            <path
              d={pathData}
              fill="none"
              stroke="#ffe4e6"
              strokeWidth="2.5"
              strokeDasharray="6 7"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Snake Tail Taper point */}
            <circle cx={tx} cy={ty} r="4" fill="#be185d" />

            {/* Expressive & Elegant Snake Head */}
            <g transform={`translate(${hx}, ${hy}) rotate(${angle})`}>
              {/* Little cute forked tongue */}
              <path
                d="M -16 0 L -23 -3 M -16 0 L -23 3"
                stroke="#ff2d87"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Head shape */}
              <ellipse
                cx="-6"
                cy="0"
                rx="14"
                ry="10"
                fill="url(#snakeHeadGrad)"
                stroke="#ffe4e6"
                strokeWidth="1.5"
              />

              {/* Eyes */}
              <circle cx="-5" cy="-5" r="2.8" fill="#1e1b2e" />
              <circle cx="-6" cy="-5.5" r="1" fill="#ffffff" />

              <circle cx="-5" cy="5" r="2.8" fill="#1e1b2e" />
              <circle cx="-6" cy="4.5" r="1" fill="#ffffff" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
