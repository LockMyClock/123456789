import type { Position } from '../types';

interface PokerTableProps {
  heroPosition?: Position;
  villainPosition?: Position;
  highlightHero?: boolean;
}

const SEAT_POSITIONS: Record<Position, { x: number; y: number }> = {
  UTG: { x: 15, y: 18 },
  MP:  { x: 85, y: 18 },
  CO:  { x: 95, y: 52 },
  BTN: { x: 80, y: 86 },
  SB:  { x: 38, y: 86 },
  BB:  { x: 5,  y: 52 },
};

export default function PokerTable({ heroPosition, villainPosition, highlightHero }: PokerTableProps) {
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '640/380', margin: '0 auto' }}>
      <svg viewBox="0 0 640 380" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="felt" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1d7a45" />
            <stop offset="60%" stopColor="#166535" />
            <stop offset="100%" stopColor="#0f4a28" />
          </radialGradient>
          <radialGradient id="feltShine" cx="40%" cy="35%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="6" stdDeviation="20" floodColor="#000" floodOpacity="0.7" />
          </filter>
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer shadow */}
        <ellipse cx="320" cy="190" rx="315" ry="185" fill="#050510" filter="url(#shadow)" />
        {/* Rail gradient */}
        <ellipse cx="320" cy="190" rx="310" ry="180" fill="#1a1008" />
        <ellipse cx="320" cy="190" rx="305" ry="175" fill="#2d1f0f" />
        <ellipse cx="320" cy="190" rx="298" ry="168" fill="#3d2a15" stroke="#4a3018" strokeWidth="1.5" />
        {/* Felt */}
        <ellipse cx="320" cy="190" rx="280" ry="152" fill="url(#felt)" />
        <ellipse cx="320" cy="190" rx="280" ry="152" fill="url(#feltShine)" />
        {/* Inner line */}
        <ellipse cx="320" cy="190" rx="240" ry="122" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="6 6" />
        {/* Center text */}
        <text x="320" y="185" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.025)" fontSize="40" fontWeight="900" fontFamily="Orbitron, sans-serif" letterSpacing="12">
          6MAX
        </text>
      </svg>

      {/* Seats */}
      {positions.map(pos => {
        const sp = SEAT_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const isVillain = pos === villainPosition;

        let bg = 'rgba(15,15,30,0.8)';
        let border = '1.5px solid rgba(255,255,255,0.08)';
        let shadow = '0 2px 10px rgba(0,0,0,0.5)';
        let textColor = 'rgba(255,255,255,0.4)';

        if (isHero) {
          bg = 'linear-gradient(135deg, #00cc66, #00ff88)';
          border = '2px solid rgba(255,255,255,0.5)';
          shadow = '0 0 30px rgba(0,255,136,0.5)';
          textColor = '#000';
        } else if (isVillain) {
          bg = 'linear-gradient(135deg, #cc0033, #ff3355)';
          border = '2px solid rgba(255,255,255,0.3)';
          shadow = '0 0 25px rgba(255,51,85,0.5)';
          textColor = '#fff';
        }

        return (
          <div
            key={pos}
            style={{
              position: 'absolute',
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              transform: 'translate(-50%, -50%)',
              background: bg,
              color: textColor,
              padding: '6px 18px',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: '2px',
              boxShadow: shadow,
              border,
              fontFamily: 'var(--font-display)',
              animation: isHero && highlightHero ? 'pulse 2s ease-in-out infinite' : undefined,
            }}
          >
            {pos}
          </div>
        );
      })}
    </div>
  );
}
