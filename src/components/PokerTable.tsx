import type { Position, Card as CardType } from '../types';
import CardDisplay from './CardDisplay';

interface PokerTableProps {
  heroPosition?: Position;
  villainPosition?: Position;
  heroCards?: [CardType, CardType];
  highlightHero?: boolean;
}

const SEAT_POSITIONS: Record<Position, { x: number; y: number; labelY: number }> = {
  UTG: { x: 18, y: 22, labelY: -1 },
  MP:  { x: 82, y: 22, labelY: -1 },
  CO:  { x: 94, y: 55, labelY: 0 },
  BTN: { x: 82, y: 85, labelY: 1 },
  SB:  { x: 38, y: 85, labelY: 1 },
  BB:  { x: 6,  y: 55, labelY: 0 },
};

export default function PokerTable({ heroPosition, villainPosition, heroCards, highlightHero }: PokerTableProps) {
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 520, aspectRatio: '520/340', margin: '0 auto' }}>
      {/* Table felt */}
      <svg viewBox="0 0 520 340" style={{ width: '100%', height: '100%' }}>
        <defs>
          <radialGradient id="feltGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1a6b3c" />
            <stop offset="80%" stopColor="#145a30" />
            <stop offset="100%" stopColor="#0d4423" />
          </radialGradient>
          <filter id="tableShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="12" floodColor="#000" floodOpacity="0.6" />
          </filter>
        </defs>
        {/* Outer rail */}
        <ellipse cx="260" cy="170" rx="255" ry="165" fill="#1a1a2e" filter="url(#tableShadow)" />
        <ellipse cx="260" cy="170" rx="248" ry="158" fill="#2a1f0e" />
        <ellipse cx="260" cy="170" rx="240" ry="150" fill="#3d2b14" />
        {/* Felt */}
        <ellipse cx="260" cy="170" rx="225" ry="138" fill="url(#feltGrad)" />
        {/* Inner line */}
        <ellipse cx="260" cy="170" rx="195" ry="112" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        {/* Dealer button area */}
        <text x="260" y="170" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.06)" fontSize="28" fontWeight="bold">
          6-MAX
        </text>
      </svg>

      {/* Seats */}
      {positions.map(pos => {
        const sp = SEAT_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const isVillain = pos === villainPosition;
        const isActive = isHero || isVillain;

        return (
          <div
            key={pos}
            style={{
              position: 'absolute',
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {/* Position label */}
            <div
              style={{
                background: isHero
                  ? (highlightHero ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #2563eb)')
                  : isVillain
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #374151, #1f2937)',
                color: '#fff',
                padding: '5px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.5px',
                boxShadow: isActive
                  ? `0 0 20px ${isHero ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)'}`
                  : '0 2px 8px rgba(0,0,0,0.3)',
                border: `2px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                animation: isHero && highlightHero ? 'pulse 1.5s ease-in-out infinite' : undefined,
                order: sp.labelY < 0 ? 1 : -1,
              }}
            >
              {pos}
            </div>

            {/* Cards for hero */}
            {isHero && heroCards && (
              <div style={{ display: 'flex', gap: 4, order: sp.labelY < 0 ? -1 : 1 }}>
                <CardDisplay card={heroCards[0]} size="md" />
                <CardDisplay card={heroCards[1]} size="md" />
              </div>
            )}

            {/* Card backs for villain */}
            {isVillain && (
              <div style={{ display: 'flex', gap: 3, order: sp.labelY < 0 ? -1 : 1 }}>
                <div style={{
                  width: 40, height: 56, borderRadius: 6,
                  background: 'linear-gradient(135deg, #1e3a5f, #0f1b2d)',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }} />
                <div style={{
                  width: 40, height: 56, borderRadius: 6,
                  background: 'linear-gradient(135deg, #1e3a5f, #0f1b2d)',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
