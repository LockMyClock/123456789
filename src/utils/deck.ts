import type { Card, Suit } from '../types';

const SUIT_ORDER: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANK_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANK_ORDER) {
    for (const suit of SUIT_ORDER) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealHand(): [Card, Card] {
  const deck = shuffleDeck(createDeck());
  return [deck[0], deck[1]];
}

export function dealHandForCell(row: number, col: number): [Card, Card] {
  const RANKS_ARR = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const r1 = RANKS_ARR[row];
  const r2 = RANKS_ARR[col];

  const allSuits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

  if (row === col) {
    // Pair
    const s1 = allSuits[Math.floor(Math.random() * 4)];
    let s2 = allSuits[Math.floor(Math.random() * 4)];
    while (s2 === s1) s2 = allSuits[Math.floor(Math.random() * 4)];
    return [{ rank: r1, suit: s1 }, { rank: r2, suit: s2 }];
  }

  if (row < col) {
    // Suited
    const s = allSuits[Math.floor(Math.random() * 4)];
    return [{ rank: r1, suit: s }, { rank: r2, suit: s }];
  }

  // Offsuit
  const s1 = allSuits[Math.floor(Math.random() * 4)];
  let s2 = allSuits[Math.floor(Math.random() * 4)];
  while (s2 === s1) s2 = allSuits[Math.floor(Math.random() * 4)];
  return [{ rank: r2, suit: s1 }, { rank: r1, suit: s2 }];
}

export function getSuitColor(suit: Suit): string {
  switch (suit) {
    case 'spades': return '#1a1a2e';
    case 'hearts': return '#ef4444';
    case 'diamonds': return '#3b82f6';
    case 'clubs': return '#22c55e';
  }
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
  }
}

export function handToRowCol(card1: Card, card2: Card): { row: number; col: number } {
  const RANKS_ARR = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const r1 = RANKS_ARR.indexOf(card1.rank);
  const r2 = RANKS_ARR.indexOf(card2.rank);

  if (r1 === r2) return { row: r1, col: r1 };

  const suited = card1.suit === card2.suit;
  const higher = Math.min(r1, r2);
  const lower = Math.max(r1, r2);

  if (suited) return { row: higher, col: lower };
  return { row: lower, col: higher };
}
