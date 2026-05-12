import type { Card, Suit } from '../types';

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SUIT_COLORS: Record<Suit, string> = {
  spades: '#c0c8d4',
  hearts: '#ff2244',
  diamonds: '#2288ff',
  clubs: '#00cc55',
};

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const sizeMap = {
  sm: { w: 44, h: 62, rank: 16, suit: 14, corner: 9 },
  md: { w: 56, h: 78, rank: 20, suit: 18, corner: 10 },
  lg: { w: 76, h: 106, rank: 28, suit: 24, corner: 12 },
  xl: { w: 100, h: 140, rank: 40, suit: 34, corner: 14 },
};

export default function CardDisplay({ card, size = 'lg' }: CardDisplayProps) {
  const s = sizeMap[size];
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div style={{
      width: s.w, height: s.h,
      borderRadius: 12,
      background: 'linear-gradient(145deg, #1e1e38, #141428)',
      border: `2px solid ${color}55`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: `0 0 25px ${color}33, 0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
      overflow: 'hidden',
      userSelect: 'none',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        background: `radial-gradient(ellipse at 50% 25%, ${color}12 0%, transparent 60%)`,
      }} />

      {/* Top-left corner */}
      <div style={{
        position: 'absolute', top: 4, left: 6,
        display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
      }}>
        <span style={{ fontSize: s.corner, fontWeight: 900, color, fontFamily: 'var(--font-display)' }}>
          {card.rank}
        </span>
        <span style={{ fontSize: s.corner - 1, color }}>{symbol}</span>
      </div>

      {/* Center */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontSize: s.rank,
          fontWeight: 900,
          color,
          fontFamily: 'var(--font-display)',
          textShadow: `0 0 15px ${color}66`,
          lineHeight: 1,
        }}>
          {card.rank}
        </span>
        <span style={{
          fontSize: s.suit,
          color,
          textShadow: `0 0 12px ${color}55`,
          lineHeight: 1,
          marginTop: -2,
        }}>
          {symbol}
        </span>
      </div>

      {/* Bottom-right corner */}
      <div style={{
        position: 'absolute', bottom: 4, right: 6,
        display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1,
        transform: 'rotate(180deg)',
      }}>
        <span style={{ fontSize: s.corner, fontWeight: 900, color, fontFamily: 'var(--font-display)' }}>
          {card.rank}
        </span>
        <span style={{ fontSize: s.corner - 1, color }}>{symbol}</span>
      </div>
    </div>
  );
}
