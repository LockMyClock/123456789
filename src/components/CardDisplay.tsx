import type { Card } from '../types';
import { getSuitColor, getSuitSymbol } from '../utils/deck';

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardDisplay({ card, size = 'lg' }: CardDisplayProps) {
  const sizeClasses = {
    sm: { w: 48, h: 68, rank: 18, suit: 16 },
    md: { w: 64, h: 90, rank: 24, suit: 20 },
    lg: { w: 80, h: 112, rank: 32, suit: 26 },
  };
  const s = sizeClasses[size];
  const color = getSuitColor(card.suit);
  const symbol = getSuitSymbol(card.suit);

  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
        position: 'relative',
        border: '2px solid rgba(255,255,255,0.3)',
        gap: 2,
      }}
    >
      <span style={{ fontSize: s.rank, fontWeight: 900, color, lineHeight: 1, fontFamily: "'Segoe UI', sans-serif" }}>
        {card.rank}
      </span>
      <span style={{ fontSize: s.suit, color, lineHeight: 1 }}>
        {symbol}
      </span>
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 6,
          fontSize: s.rank * 0.45,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {card.rank}{symbol}
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          right: 6,
          fontSize: s.rank * 0.45,
          fontWeight: 700,
          color,
          lineHeight: 1,
          transform: 'rotate(180deg)',
        }}
      >
        {card.rank}{symbol}
      </span>
    </div>
  );
}
