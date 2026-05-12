import type { Chart, Action } from '../types';
import { generateTrainingCells } from '../types';

function createCells(matrix: string[][]): Record<string, Action> {
  const cells: Record<string, Action> = {};
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const val = matrix[r]?.[c];
      if (val && val !== '-') {
        cells[`${r}-${c}`] = val as Action;
      }
    }
  }
  return cells;
}

const _F = 'fold'; void _F;
const R = 'raise';
const C = 'call';
const B3 = '3bet';
const M = 'mixed';
const _ = '-';

// UTG Open Range (~15%)
const utgOpen: string[][] = [
  [R, R, R, R, R, M, _, _, _, _, _, _, _],
  [R, R, R, R, R, M, _, _, _, _, _, _, _],
  [R, R, R, R, R, M, _, _, _, _, _, _, _],
  [R, R, R, R, R, M, _, _, _, _, _, _, _],
  [R, M, M, M, R, R, _, _, _, _, _, _, _],
  [M, _, _, _, _, R, R, _, _, _, _, _, _],
  [_, _, _, _, _, _, R, M, _, _, _, _, _],
  [_, _, _, _, _, _, _, R, M, _, _, _, _],
  [_, _, _, _, _, _, _, _, R, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, R, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
];

// MP Open Range (~18%)
const mpOpen: string[][] = [
  [R, R, R, R, R, R, M, _, _, _, _, _, _],
  [R, R, R, R, R, R, M, _, _, _, _, _, _],
  [R, R, R, R, R, R, M, _, _, _, _, _, _],
  [R, R, R, R, R, R, M, _, _, _, _, _, _],
  [R, R, M, M, R, R, M, _, _, _, _, _, _],
  [M, M, _, _, _, R, R, M, _, _, _, _, _],
  [M, _, _, _, _, _, R, R, _, _, _, _, _],
  [_, _, _, _, _, _, _, R, M, _, _, _, _],
  [_, _, _, _, _, _, _, _, R, M, _, _, _],
  [_, _, _, _, _, _, _, _, _, R, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
];

// CO Open Range (~27%)
const coOpen: string[][] = [
  [R, R, R, R, R, R, R, R, M, M, _, _, _],
  [R, R, R, R, R, R, R, R, M, _, _, _, _],
  [R, R, R, R, R, R, R, R, M, _, _, _, _],
  [R, R, R, R, R, R, R, M, M, _, _, _, _],
  [R, R, R, M, R, R, R, M, _, _, _, _, _],
  [R, R, M, M, M, R, R, R, M, _, _, _, _],
  [R, M, M, _, _, _, R, R, R, _, _, _, _],
  [M, M, _, _, _, _, _, R, R, M, _, _, _],
  [M, _, _, _, _, _, _, _, R, R, _, _, _],
  [_, _, _, _, _, _, _, _, _, R, M, _, _],
  [_, _, _, _, _, _, _, _, _, _, R, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
];

// BTN Open Range (~45%)
const btnOpen: string[][] = [
  [R, R, R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, R, M, M, M],
  [R, R, R, R, R, R, R, R, R, R, M, M, M],
  [R, R, R, R, R, R, R, R, R, M, M, _, _],
  [R, R, R, R, R, R, R, R, R, M, _, _, _],
  [R, R, R, R, R, R, R, R, R, M, M, _, _],
  [R, R, R, R, R, R, R, R, R, R, M, _, _],
  [R, R, M, M, M, M, M, R, R, R, R, M, _],
  [R, M, M, M, _, _, _, _, R, R, R, R, M],
  [R, M, M, M, _, _, _, _, _, R, R, R, R],
  [R, M, _, _, _, _, _, _, _, _, R, M, M],
  [M, _, _, _, _, _, _, _, _, _, _, R, M],
  [M, _, _, _, _, _, _, _, _, _, _, _, R],
];

// SB Open Range (~40%)
const sbOpen: string[][] = [
  [R, R, R, R, R, R, R, R, R, R, R, R, R],
  [R, R, R, R, R, R, R, R, R, M, M, M, _],
  [R, R, R, R, R, R, R, R, R, M, M, _, _],
  [R, R, R, R, R, R, R, R, M, M, _, _, _],
  [R, R, R, R, R, R, R, R, M, _, _, _, _],
  [R, R, R, M, M, R, R, R, R, M, _, _, _],
  [R, R, M, M, _, _, R, R, R, R, M, _, _],
  [R, M, M, _, _, _, _, R, R, R, R, _, _],
  [R, M, _, _, _, _, _, _, R, R, R, M, _],
  [R, _, _, _, _, _, _, _, _, R, R, M, M],
  [M, _, _, _, _, _, _, _, _, _, R, M, _],
  [M, _, _, _, _, _, _, _, _, _, _, R, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, R],
];

// BB Defense vs BTN Open
const bbDefVsBtn: string[][] = [
  [B3, B3, B3, B3, B3, B3, B3, C, C, C, C, C, C],
  [B3, B3, B3, B3, B3, B3, C, C, C, C, C, C, C],
  [B3, B3, B3, B3, B3, C, C, C, C, C, C, C, M],
  [B3, B3, M, C, C, C, C, C, C, C, M, M, _],
  [B3, M, C, C, C, C, C, C, C, M, _, _, _],
  [M, C, C, C, C, C, C, C, C, M, _, _, _],
  [C, C, C, C, C, C, C, C, C, C, M, _, _],
  [C, C, C, C, C, C, C, C, C, C, C, M, _],
  [C, C, C, M, M, M, M, M, C, C, C, C, M],
  [C, M, M, M, _, _, _, _, M, C, C, C, C],
  [C, M, M, _, _, _, _, _, _, _, C, C, C],
  [M, M, _, _, _, _, _, _, _, _, _, C, M],
  [M, M, _, _, _, _, _, _, _, _, _, _, C],
];

// BB Defense vs SB Open
const bbDefVsSB: string[][] = [
  [B3, B3, B3, B3, B3, B3, B3, B3, C, C, C, C, C],
  [B3, B3, B3, B3, B3, B3, B3, C, C, C, C, C, C],
  [B3, B3, B3, B3, B3, B3, C, C, C, C, C, C, C],
  [B3, B3, B3, B3, B3, C, C, C, C, C, C, M, M],
  [B3, B3, M, C, C, C, C, C, C, C, M, M, _],
  [B3, C, C, C, C, C, C, C, C, C, M, _, _],
  [B3, C, C, C, C, C, C, C, C, C, C, M, _],
  [C, C, C, C, C, C, C, C, C, C, C, C, M],
  [C, C, C, C, C, M, M, M, C, C, C, C, C],
  [C, C, C, M, M, M, _, _, M, C, C, C, C],
  [C, M, M, M, _, _, _, _, _, _, C, C, C],
  [C, M, M, _, _, _, _, _, _, _, _, C, M],
  [M, M, M, _, _, _, _, _, _, _, _, _, C],
];

// BB Defense vs CO Open
const bbDefVsCO: string[][] = [
  [B3, B3, B3, B3, B3, B3, C, C, C, C, C, M, M],
  [B3, B3, B3, B3, B3, C, C, C, C, C, M, M, _],
  [B3, B3, B3, B3, C, C, C, C, C, M, M, _, _],
  [B3, M, C, C, C, C, C, C, C, M, _, _, _],
  [B3, M, C, C, C, C, C, C, M, _, _, _, _],
  [M, C, C, C, C, C, C, C, C, M, _, _, _],
  [C, C, C, C, C, C, C, C, C, C, M, _, _],
  [C, C, C, C, C, M, M, C, C, C, C, M, _],
  [C, M, M, M, M, _, _, _, C, C, C, C, _],
  [C, M, M, _, _, _, _, _, _, C, C, C, M],
  [M, _, _, _, _, _, _, _, _, _, C, C, _],
  [_, _, _, _, _, _, _, _, _, _, _, C, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, C],
];

// BB Defense vs MP Open
const bbDefVsMP: string[][] = [
  [B3, B3, B3, B3, B3, M, C, C, C, M, _, _, _],
  [B3, B3, B3, B3, M, C, C, C, M, _, _, _, _],
  [B3, M, B3, M, C, C, C, C, M, _, _, _, _],
  [B3, M, C, C, C, C, C, C, M, _, _, _, _],
  [M, C, C, C, C, C, C, M, _, _, _, _, _],
  [M, C, C, C, C, C, C, C, M, _, _, _, _],
  [C, C, C, C, C, C, C, C, C, M, _, _, _],
  [C, C, M, M, M, M, M, C, C, C, M, _, _],
  [C, M, _, _, _, _, _, _, C, C, C, M, _],
  [M, _, _, _, _, _, _, _, _, C, C, C, _],
  [_, _, _, _, _, _, _, _, _, _, C, M, _],
  [_, _, _, _, _, _, _, _, _, _, _, C, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
];

// BB Defense vs UTG Open
const bbDefVsUTG: string[][] = [
  [B3, B3, B3, B3, M, C, C, C, M, _, _, _, _],
  [B3, B3, B3, M, C, C, C, M, _, _, _, _, _],
  [B3, M, B3, C, C, C, C, M, _, _, _, _, _],
  [M, C, C, C, C, C, C, M, _, _, _, _, _],
  [M, C, C, C, C, C, M, _, _, _, _, _, _],
  [C, C, C, C, C, C, C, M, _, _, _, _, _],
  [C, C, M, M, M, M, C, C, C, M, _, _, _],
  [C, M, _, _, _, _, _, C, C, C, _, _, _],
  [M, _, _, _, _, _, _, _, C, C, M, _, _],
  [_, _, _, _, _, _, _, _, _, C, C, _, _],
  [_, _, _, _, _, _, _, _, _, _, C, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _],
];

const now = Date.now();

function chartWithTraining(chart: Omit<Chart, 'trainingCells'>): Chart {
  return { ...chart, trainingCells: generateTrainingCells(chart.cells) };
}

export const defaultCharts: Chart[] = [
  // Open charts
  chartWithTraining({ id: 'default-utg-open', name: 'UTG Open', section: 'Open', position: 'UTG', scenario: 'Open', cells: createCells(utgOpen), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-mp-open', name: 'MP Open', section: 'Open', position: 'MP', scenario: 'Open', cells: createCells(mpOpen), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-co-open', name: 'CO Open', section: 'Open', position: 'CO', scenario: 'Open', cells: createCells(coOpen), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-btn-open', name: 'BTN Open', section: 'Open', position: 'BTN', scenario: 'Open', cells: createCells(btnOpen), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-sb-open', name: 'SB Open', section: 'Open', position: 'SB', scenario: 'Open', cells: createCells(sbOpen), createdAt: now, updatedAt: now }),
  // BB Defense charts
  chartWithTraining({ id: 'default-bb-vs-btn', name: 'BB vs BTN', section: 'BB Defense', position: 'BB', scenario: 'BB Defense', vsPosition: 'BTN', cells: createCells(bbDefVsBtn), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-bb-vs-sb', name: 'BB vs SB', section: 'BB Defense', position: 'BB', scenario: 'BB Defense', vsPosition: 'SB', cells: createCells(bbDefVsSB), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-bb-vs-co', name: 'BB vs CO', section: 'BB Defense', position: 'BB', scenario: 'BB Defense', vsPosition: 'CO', cells: createCells(bbDefVsCO), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-bb-vs-mp', name: 'BB vs MP', section: 'BB Defense', position: 'BB', scenario: 'BB Defense', vsPosition: 'MP', cells: createCells(bbDefVsMP), createdAt: now, updatedAt: now }),
  chartWithTraining({ id: 'default-bb-vs-utg', name: 'BB vs UTG', section: 'BB Defense', position: 'BB', scenario: 'BB Defense', vsPosition: 'UTG', cells: createCells(bbDefVsUTG), createdAt: now, updatedAt: now }),
];
