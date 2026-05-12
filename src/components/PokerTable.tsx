import type { Position } from '../types';

interface PokerTableProps {
  heroPosition?: Position;
  villainPosition?: Position;
  highlightHero?: boolean;
}

const SEAT_POSITIONS: Record<Position, { x: number; y: number }> = {
  UTG: { x: 18, y: 22 },
  MP:  { x: 82, y: 22 },
  CO:  { x: 94, y: 55 },
  BTN: { x: 82, y: 85 },
  SB:  { x: 38, y: 85 },
  BB:  { x: 6,  y: 55 },
};

export default function PokerTable({ heroPosition, villainPosition, highlightHero }: PokerTableProps) {
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 520, aspectRatio: '520/320', margin: '0 auto' }}>
      <svg viewBox="0 0 520 320" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="feltGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a6b3c" />
            <stop offset="70%" stopColor="#145a30" />
            <stop offset="100%" stopColor="#0d4423" />
          </radialGradient>
          <filter id="tableShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="16" floodColor="#000" floodOpacity="0.7" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer rail */}
        <ellipse cx="260" cy="160" rx="255" ry="155" fill="#0d0d1a" filter="url(#tableShadow)" />
        <ellipse cx="260" cy="160" rx="250" ry="150" fill="#2a1f0e" />
        <ellipse cx="260" cy="160" rx="243" ry="143" fill="#3d2b14" stroke="#4a3520" strokeWidth="1" />
        {/* Felt */}
        <ellipse cx="260" cy="160" rx="228" ry="130" fill="url(#feltGrad)" />
        {/* Inner line */}
        <ellipse cx="260" cy="160" rx="195" ry="105" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
        <text x="260" y="162" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.04)" fontSize="32" fontWeight="900" letterSpacing="8">
          6-MAX
        </text>
      </svg>

      {/* Seats */}
      {positions.map(pos => {
        const sp = SEAT_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const isVillain = pos === villainPosition;

        let bg = 'linear-gradient(135deg, #1e293b, #0f172a)';
        let border = '2px solid rgba(255,255,255,0.1)';
        let shadow = '0 2px 10px rgba(0,0,0,0.4)';

        if (isHero) {
          bg = highlightHero
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'linear-gradient(135deg, #3b82f6, #2563eb)';
          border = '2px solid rgba(255,255,255,0.4)';
          shadow = `0 0 24px ${highlightHero ? 'rgba(34,197,94,0.6)' : 'rgba(59,130,246,0.6)'}`;
        } else if (isVillain) {
          bg = 'linear-gradient(135deg, #ef4444, #dc2626)';
          border = '2px solid rgba(255,255,255,0.3)';
          shadow = '0 0 20px rgba(239,68,68,0.5)';
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
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 24,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: shadow,
              border,
              animation: isHero && highlightHero ? 'pulse 1.5s ease-in-out infinite' : undefined,
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            {pos}
          </div>
        );
      })}
    </div>
  );
}
