import type { Position } from '../types';
import type { Card as CardType } from '../types';
import PositionLabel from './PositionLabel';
import DealerButton from './DealerButton';
import BlindChip from './BlindChip';
import OpponentCards from './OpponentCards';
import HeroHand from './HeroHand';
import PotInfo from './PotInfo';

interface PreflopTrainerTableProps {
  heroPosition: Position;
  villainPosition?: Position;
  heroCards: [CardType, CardType] | null;
  dealKey: number;
  scenario: string;
}

const ALL_POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

// 6 seats around the table: hero is always seat 0 (bottom center)
// Positions are placed around the ellipse
const SEAT_COORDS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 97 },   // bottom center (hero) — just below table edge
  1: { x: 3,  y: 68 },   // left-bottom
  2: { x: 3,  y: 25 },   // left-top
  3: { x: 35, y: 2 },    // top-left
  4: { x: 65, y: 2 },    // top-right
  5: { x: 97, y: 25 },   // right-top
};

// Where opponent face-down cards go (inside the table)
const OPPONENT_CARD_COORDS: Record<number, { x: number; y: number }> = {
  1: { x: 16, y: 58 },
  2: { x: 14, y: 30 },
  3: { x: 38, y: 15 },
  4: { x: 62, y: 15 },
  5: { x: 86, y: 30 },
};

// Offset for dealer button relative to seat
const DEALER_OFFSETS: Record<number, { dx: number; dy: number }> = {
  0: { dx: 8,  dy: -6 },
  1: { dx: 8,  dy: -3 },
  2: { dx: 8,  dy: 5 },
  3: { dx: 6,  dy: 7 },
  4: { dx: -6, dy: 7 },
  5: { dx: -8, dy: 5 },
};

// Offset for blind chips relative to opponent card position (or seat for hero)
const BLIND_CHIP_COORDS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 78 },
  1: { x: 24, y: 60 },
  2: { x: 22, y: 34 },
  3: { x: 40, y: 22 },
  4: { x: 60, y: 22 },
  5: { x: 78, y: 34 },
};

function getRotatedPositions(heroPos: Position): Position[] {
  const heroIdx = ALL_POSITIONS.indexOf(heroPos);
  const rotated: Position[] = [];
  for (let i = 0; i < 6; i++) {
    rotated.push(ALL_POSITIONS[(heroIdx + i) % 6]);
  }
  return rotated;
}

export default function PreflopTrainerTable({
  heroPosition,
  villainPosition,
  heroCards,
  dealKey,
  scenario,
}: PreflopTrainerTableProps) {
  const rotated = getRotatedPositions(heroPosition);

  const btnSeatIdx = rotated.indexOf('BTN');
  const sbSeatIdx = rotated.indexOf('SB');
  const bbSeatIdx = rotated.indexOf('BB');

  return (
    <div className="relative w-full max-w-[750px] mx-auto flex flex-col items-center">
      {/* Table wrapper */}
      <div className="relative w-full" style={{ aspectRatio: '750/420' }}>
        {/* Table SVG */}
        <svg viewBox="0 0 750 420" className="w-full h-full absolute inset-0">
          <defs>
            <radialGradient id="feltGrad" cx="50%" cy="48%">
              <stop offset="0%" stopColor="#1d7a45" />
              <stop offset="50%" stopColor="#166535" />
              <stop offset="100%" stopColor="#0f4a28" />
            </radialGradient>
            <radialGradient id="feltShine" cx="40%" cy="35%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="outerShadow">
              <feDropShadow dx="0" dy="6" stdDeviation="20" floodColor="#000" floodOpacity="0.7" />
            </filter>
          </defs>
          {/* Shadow */}
          <ellipse cx="375" cy="210" rx="370" ry="205" fill="#080c12" filter="url(#outerShadow)" />
          {/* Rail */}
          <ellipse cx="375" cy="210" rx="365" ry="200" fill="#1a100a" />
          <ellipse cx="375" cy="210" rx="358" ry="193" fill="#2d1c0f" />
          <ellipse cx="375" cy="210" rx="352" ry="187"
            fill="url(#feltGrad)" stroke="#3d2a15" strokeWidth="2.5"
          />
          <ellipse cx="375" cy="210" rx="352" ry="187" fill="url(#feltShine)" />
          {/* Dashed inner ring */}
          <ellipse cx="375" cy="210" rx="290" ry="145" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="6 6" />
          {/* Watermark */}
          <text x="375" y="200" textAnchor="middle" dominantBaseline="central"
            fill="rgba(255,255,255,0.025)" fontSize="28" fontWeight="900"
            fontFamily="Orbitron, sans-serif" letterSpacing="6">
            ПОКЕРОК
          </text>
        </svg>

        {/* Pot info in center */}
        <div className="absolute z-20" style={{ left: '50%', top: '42%', transform: 'translate(-50%, -50%)' }}>
          <PotInfo potBB={1.5} heroPosition={heroPosition} scenario={scenario} />
        </div>

        {/* Seats */}
        {rotated.map((pos, seatIdx) => {
          const isHero = seatIdx === 0;
          if (isHero) return null; // hero label rendered outside table
          const coord = SEAT_COORDS[seatIdx];
          const isVillain = pos === villainPosition;
          const oppCardCoord = OPPONENT_CARD_COORDS[seatIdx];

          return (
            <div key={pos}>
              {/* Seat label */}
              <div
                className="absolute z-30"
                style={{
                  left: `${coord.x}%`,
                  top: `${coord.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <PositionLabel
                  position={pos}
                  isHero={false}
                  isActive={isVillain}
                />
              </div>

              {/* Opponent face-down cards (inside table) */}
              {oppCardCoord && (
                <div
                  className="absolute z-10"
                  style={{
                    left: `${oppCardCoord.x}%`,
                    top: `${oppCardCoord.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <OpponentCards />
                </div>
              )}
            </div>
          );
        })}

        {/* Dealer button — near BTN seat */}
        {(() => {
          const btnCoord = SEAT_COORDS[btnSeatIdx];
          const btnOff = DEALER_OFFSETS[btnSeatIdx];
          return <DealerButton x={btnCoord.x + btnOff.dx} y={btnCoord.y + btnOff.dy} />;
        })()}

        {/* SB blind chip */}
        {(() => {
          const c = BLIND_CHIP_COORDS[sbSeatIdx];
          return <BlindChip type="sb" x={c.x} y={c.y} />;
        })()}

        {/* BB blind chip */}
        {(() => {
          const c = BLIND_CHIP_COORDS[bbSeatIdx];
          return <BlindChip type="bb" x={c.x} y={c.y} />;
        })()}
      </div>

      {/* Hero position label */}
      <div className="z-30 -mt-6 mb-1">
        <PositionLabel position={heroPosition} isHero isActive={false} />
      </div>

      {/* Hero cards — below the table, centered */}
      {heroCards && (
        <div className="z-40 -mt-1">
          <HeroHand cards={heroCards} dealKey={dealKey} />
        </div>
      )}
    </div>
  );
}
