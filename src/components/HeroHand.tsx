import type { Card as CardType, Suit } from '../types';

interface HeroHandProps {
  cards: [CardType, CardType];
  dealKey: number;
}

const SUIT_COLORS: Record<Suit, string> = {
  spades: '#d0d5dd',
  hearts: '#ef4444',
  diamonds: '#3b82f6',
  clubs: '#22c55e',
};

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

function HeroCard({ card, className }: { card: CardType; className?: string }) {
  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <div
      className={`relative w-[90px] h-[130px] rounded-xl overflow-hidden select-none ${className || ''}`}
      style={{
        background: 'linear-gradient(155deg, #1c1c32 0%, #151528 40%, #0e0e20 100%)',
        border: `2px solid ${color}44`,
        boxShadow: `0 0 20px ${color}22, 0 8px 25px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{ background: `radial-gradient(ellipse at 50% 20%, ${color}10 0%, transparent 60%)` }}
      />

      {/* Top-left corner */}
      <div className="absolute top-2 left-2 flex flex-col items-center leading-none">
        <span className="text-[13px] font-black font-display" style={{ color, textShadow: `0 0 8px ${color}44` }}>
          {card.rank}
        </span>
        <span className="text-[11px]" style={{ color }}>{symbol}</span>
      </div>

      {/* Center rank + suit */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <span
          className="text-[38px] font-black font-display leading-none"
          style={{ color, textShadow: `0 0 20px ${color}55, 0 2px 4px rgba(0,0,0,0.5)` }}
        >
          {card.rank}
        </span>
        <span
          className="text-[30px] leading-none -mt-1"
          style={{ color, textShadow: `0 0 15px ${color}44` }}
        >
          {symbol}
        </span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className="absolute bottom-2 right-2 flex flex-col items-center leading-none rotate-180">
        <span className="text-[13px] font-black font-display" style={{ color, textShadow: `0 0 8px ${color}44` }}>
          {card.rank}
        </span>
        <span className="text-[11px]" style={{ color }}>{symbol}</span>
      </div>
    </div>
  );
}

export default function HeroHand({ cards, dealKey }: HeroHandProps) {
  return (
    <div className="flex gap-2" key={dealKey}>
      <HeroCard card={cards[0]} className="animate-deal-left" />
      <HeroCard card={cards[1]} className="animate-deal-right" />
    </div>
  );
}
