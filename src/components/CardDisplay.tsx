import type { Card } from '../types';
import { getSuitSymbol } from '../utils/deck';

interface CardDisplayProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SUIT_COLORS: Record<string, string> = {
  spades: '#e2e8f0',
  hearts: '#ef4444',
  diamonds: '#3b82f6',
  clubs: '#22c55e',
};

export default function CardDisplay({ card, size = 'lg' }: CardDisplayProps) {
  const sizeMap = {
    sm: { w: 44, h: 62, rank: 16, suit: 14, corner: 9 },
    md: { w: 56, h: 78, rank: 20, suit: 18, corner: 10 },
    lg: { w: 76, h: 106, rank: 28, suit: 24, corner: 12 },
    xl: { w: 96, h: 134, rank: 36, suit: 30, corner: 14 },
  };
  const s = sizeMap[size];
  const color = SUIT_COLORS[card.suit];
  const symbol = getSuitSymbol(card.suit);

  return (
    <div
      style={{
        width: s.w,
        height: s.h,
        background: '#1a1a2e',
        borderRadius: s.w * 0.1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 20px ${color}33, 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
        position: 'relative',
        border: `1.5px solid ${color}66`,
        gap: 0,
        overflow: 'hidden',
      }}
    >
      {/* Glow background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 30%, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <span style={{
        fontSize: s.rank,
        fontWeight: 900,
        color,
        lineHeight: 1,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        textShadow: `0 0 10px ${color}88`,
        zIndex: 1,
      }}>
        {card.rank}
      </span>
      <span style={{
        fontSize: s.suit,
        color,
        lineHeight: 1,
        filter: `drop-shadow(0 0 6px ${color}66)`,
        zIndex: 1,
      }}>
        {symbol}
      </span>

      {/* Top-left corner */}
      <span style={{
        position: 'absolute',
        top: 3,
        left: 5,
        fontSize: s.corner,
        fontWeight: 800,
        color,
        lineHeight: 1.1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
      }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: s.corner * 0.9 }}>{symbol}</span>
      </span>

      {/* Bottom-right corner */}
      <span style={{
        position: 'absolute',
        bottom: 3,
        right: 5,
        fontSize: s.corner,
        fontWeight: 800,
        color,
        lineHeight: 1.1,
        transform: 'rotate(180deg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 1,
      }}>
        <span>{card.rank}</span>
        <span style={{ fontSize: s.corner * 0.9 }}>{symbol}</span>
      </span>
    </div>
  );
}
