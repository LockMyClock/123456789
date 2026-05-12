export type Action = 'fold' | 'call' | 'raise' | '3bet' | '4bet' | 'mixed';

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export type Scenario =
  | 'Open'
  | 'vs Open'
  | '3-Bet'
  | 'vs 3-Bet'
  | '4-Bet'
  | 'vs 4-Bet'
  | 'BB Defense';

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  rank: string;
  suit: Suit;
}

export interface ChartCell {
  row: number;
  col: number;
  action: Action;
}

export interface Chart {
  id: string;
  name: string;
  section: string;
  position: Position;
  scenario: Scenario;
  vsPosition?: Position;
  cells: Record<string, Action>;
  createdAt: number;
  updatedAt: number;
}

export interface TrainingResult {
  hand: string;
  correctAction: Action;
  userAction: Action;
  isCorrect: boolean;
  timestamp: number;
}

export interface TrainingSession {
  chartIds: string[];
  results: TrainingResult[];
  startedAt: number;
}

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export const POSITIONS: Position[] = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

export const SCENARIOS: Scenario[] = ['Open', 'vs Open', '3-Bet', 'vs 3-Bet', '4-Bet', 'vs 4-Bet', 'BB Defense'];

export const ACTION_COLORS: Record<Action, string> = {
  fold: '#2a2a3e',
  call: '#22c55e',
  raise: '#ef4444',
  '3bet': '#f59e0b',
  '4bet': '#a855f7',
  mixed: 'linear-gradient(135deg, #22c55e 0%, #ef4444 50%, #f59e0b 100%)',
};

export const ACTION_LABELS: Record<Action, string> = {
  fold: 'Fold',
  call: 'Call',
  raise: 'Raise',
  '3bet': '3-Bet',
  '4bet': '4-Bet',
  mixed: 'Mixed',
};

export function getCellLabel(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

export function getHandFromRowCol(row: number, col: number): { label: string; suited: boolean; pair: boolean } {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return { label: `${r1}${r2}`, suited: false, pair: true };
  if (row < col) return { label: `${r1}${r2}s`, suited: true, pair: false };
  return { label: `${r2}${r1}o`, suited: false, pair: false };
}
