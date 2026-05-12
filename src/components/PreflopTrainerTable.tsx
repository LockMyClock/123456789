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

const SEAT_ANGLES: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 90 },   // bottom center (hero)
  1: { x: 10, y: 65 },   // left-bottom
  2: { x: 5,  y: 28 },   // left-top
  3: { x: 35, y: 8 },    // top-left
  4: { x: 65, y: 8 },    // top-right
  5: { x: 95, y: 28 },   // right-top
};

const CARD_OFFSETS: Record<number, { x: number; y: number }> = {
  0: { x: 50, y: 72 },
  1: { x: 17, y: 58 },
  2: { x: 13, y: 30 },
  3: { x: 38, y: 16 },
  4: { x: 62, y: 16 },
  5: { x: 87, y: 30 },
};

const DEALER_OFFSETS: Record<number, { dx: number; dy: number }> = {
  0: { dx: 8, dy: -8 },
  1: { dx: 8, dy: -5 },
  2: { dx: 8, dy: 5 },
  3: { dx: 5, dy: 8 },
  4: { dx: -5, dy: 8 },
  5: { dx: -8, dy: 5 },
};

const BLIND_OFFSETS: Record<number, { dx: number; dy: number }> = {
  0: { dx: 0, dy: -12 },
  1: { dx: 8, dy: -6 },
  2: { dx: 8, dy: 4 },
  3: { dx: 4, dy: 8 },
  4: { dx: -4, dy: 8 },
  5: { dx: -8, dy: 4 },
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

  const btnPos = SEAT_ANGLES[btnSeatIdx];
  const btnOff = DEALER_OFFSETS[btnSeatIdx];

  const sbCard = CARD_OFFSETS[sbSeatIdx];
  const sbBlindOff = BLIND_OFFSETS[sbSeatIdx];
  const bbCard = CARD_OFFSETS[bbSeatIdx];
  const bbBlindOff = BLIND_OFFSETS[bbSeatIdx];

  return (
    <div className="relative w-full max-w-[720px] mx-auto" style={{ aspectRatio: '720/440' }}>
      {/* Table SVG */}
      <svg viewBox="0 0 720 440" className="w-full h-full absolute inset-0">
        <defs>
          <radialGradient id="feltGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1d7a45" />
            <stop offset="50%" stopColor="#166535" />
            <stop offset="100%" stopColor="#0f4a28" />
          </radialGradient>
          <radialGradient id="feltShine" cx="40%" cy="35%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="tableShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="25" floodColor="#000" floodOpacity="0.8" />
          </filter>
        </defs>
        {/* Outer shadow */}
        <ellipse cx="360" cy="220" rx="355" ry="215" fill="#0a0e14" filter="url(#tableShadow)" />
        {/* Rail layers */}
        <ellipse cx="360" cy="220" rx="350" ry="210" fill="#1a100a" />
        <ellipse cx="360" cy="220" rx="344" ry="204" fill="#2d1c0f" />
        <ellipse cx="360" cy="220" rx="338" ry="198"
          fill="url(#feltGrad)"
          stroke="#3d2a15" strokeWidth="3"
        />
        {/* Shine overlay */}
        <ellipse cx="360" cy="220" rx="338" ry="198" fill="url(#feltShine)" />
        {/* Inner dashed ring */}
        <ellipse cx="360" cy="220" rx="280" ry="150" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" strokeDasharray="8 8" />
        {/* Center watermark */}
        <text x="360" y="195" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.025)" fontSize="32" fontWeight="900" fontFamily="Orbitron, sans-serif" letterSpacing="8">
          PREFLOP
        </text>
        <text x="360" y="230" textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.018)" fontSize="18" fontWeight="700" fontFamily="Orbitron, sans-serif" letterSpacing="12">
          TRAINER
        </text>
      </svg>

      {/* Pot info in center */}
      <div className="absolute z-20" style={{ left: '50%', top: '45%', transform: 'translate(-50%, -50%)' }}>
        <PotInfo potBB={1.5} heroPosition={heroPosition} scenario={scenario} />
      </div>

      {/* Seats */}
      {rotated.map((pos, seatIdx) => {
        const coord = SEAT_ANGLES[seatIdx];
        const cardCoord = CARD_OFFSETS[seatIdx];
        const isHero = seatIdx === 0;
        const isVillain = pos === villainPosition;

        return (
          <div key={pos}>
            {/* Position label */}
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
                isHero={isHero}
                isActive={isVillain}
              />
            </div>

            {/* Opponent cards */}
            {!isHero && (
              <div
                className="absolute z-15"
                style={{
                  left: `${cardCoord.x}%`,
                  top: `${cardCoord.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <OpponentCards />
              </div>
            )}
          </div>
        );
      })}

      {/* Dealer button */}
      <DealerButton
        x={btnPos.x + btnOff.dx}
        y={btnPos.y + btnOff.dy}
      />

      {/* SB chip */}
      <BlindChip
        type="sb"
        x={sbCard.x + sbBlindOff.dx}
        y={sbCard.y + sbBlindOff.dy}
      />

      {/* BB chip */}
      <BlindChip
        type="bb"
        x={bbCard.x + bbBlindOff.dx}
        y={bbCard.y + bbBlindOff.dy}
      />

      {/* Hero cards — centered at bottom */}
      {heroCards && (
        <div
          className="absolute z-40"
          style={{
            left: '50%',
            bottom: '2%',
            transform: 'translateX(-50%)',
          }}
        >
          <HeroHand cards={heroCards} dealKey={dealKey} />
        </div>
      )}
    </div>
  );
}
