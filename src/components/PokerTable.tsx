import type { Position, Card as CardType } from '../types';
import CardDisplay from './CardDisplay';

interface PokerTableProps {
  heroPosition?: Position;
  villainPosition?: Position;
  heroCards?: [CardType, CardType];
  highlightHero?: boolean;
}

const SEAT_POSITIONS: Record<Position, { x: number; y: number; labelY: number }> = {
  UTG: { x: 21, y: 18, labelY: -1 },
  MP:  { x: 79, y: 18, labelY: -1 },
  CO:  { x: 93, y: 50, labelY: 0 },
  BTN: { x: 79, y: 82, labelY: 1 },
  SB:  { x: 21, y: 82, labelY: 1 },
  BB:  { x: 7,  y: 50, labelY: 0 },
};

const BLIND_INFO: Partial<Record<Position, { label: string; amount: string }>> = {
  SB: { label: 'SB', amount: '0.5' },
  BB: { label: 'BB', amount: '1' },
};

const CHIP_POSITIONS: Partial<Record<Position, { x: number; y: number }>> = {
  SB: { x: 34, y: 68 },
  BB: { x: 20, y: 44 },
};

function ChipIcon({ x, y, amount }: { x: number; y: number; amount: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="2" rx="14" ry="8" fill="#0d4423" opacity="0.5" />
      <ellipse cx="0" cy="0" rx="14" ry="8" fill="#d4a017" />
      <ellipse cx="0" cy="-1" rx="11" ry="6" fill="#e6b422" />
      <ellipse cx="0" cy="-1" rx="8" ry="4.5" fill="#d4a017" stroke="#c49000" strokeWidth="0.5" />
      <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="7" fontWeight="800">
        {amount}
      </text>
    </g>
  );
}

export default function PokerTable({ heroPosition, villainPosition, heroCards, highlightHero }: PokerTableProps) {
  const positions: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

  const btnPosition = SEAT_POSITIONS['BTN'];
  const btnChipX = (btnPosition.x / 100) * 520 - 30;
  const btnChipY = (btnPosition.y / 100) * 340 - 20;

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
        {/* Center text */}
        <text x="260" y="170" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.06)" fontSize="28" fontWeight="bold">
          6-MAX
        </text>

        {/* Blind chips on table */}
        {Object.entries(CHIP_POSITIONS).map(([pos, coords]) => {
          const blind = BLIND_INFO[pos as Position];
          if (!coords || !blind) return null;
          const cx = (coords.x / 100) * 520;
          const cy = (coords.y / 100) * 340;
          return <ChipIcon key={pos} x={cx} y={cy} amount={blind.amount} />;
        })}

        {/* Dealer button */}
        <circle cx={btnChipX} cy={btnChipY} r="13" fill="#f5f5f5" stroke="#ccc" strokeWidth="1.5" />
        <circle cx={btnChipX} cy={btnChipY} r="10" fill="#fff" />
        <text x={btnChipX} y={btnChipY} textAnchor="middle" dominantBaseline="central" fill="#222" fontSize="9" fontWeight="900">
          D
        </text>
      </svg>

      {/* Seats */}
      {positions.map(pos => {
        const sp = SEAT_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const isVillain = pos === villainPosition;
        const isActive = isHero || isVillain;
        const blind = BLIND_INFO[pos];

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
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {pos}
              {blind && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  ({blind.amount}bb)
                </span>
              )}
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
                  width: 48, height: 67, borderRadius: 7,
                  background: 'linear-gradient(135deg, #1e3a5f, #0f1b2d)',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 30, height: 44, borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 6px)',
                  }} />
                </div>
                <div style={{
                  width: 48, height: 67, borderRadius: 7,
                  background: 'linear-gradient(135deg, #1e3a5f, #0f1b2d)',
                  border: '2px solid #2563eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 30, height: 44, borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.05) 3px, rgba(255,255,255,0.05) 6px)',
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
