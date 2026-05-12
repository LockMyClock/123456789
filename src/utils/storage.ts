import type { Chart } from '../types';
import { defaultCharts } from '../data/defaultCharts';

const STORAGE_KEY = 'preflop-trainer-charts';

export function loadCharts(): Chart[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...defaultCharts];
    const saved: Chart[] = JSON.parse(raw);
    const savedIds = new Set(saved.map(c => c.id));
    const missing = defaultCharts.filter(d => !savedIds.has(d.id));
    return [...saved, ...missing];
  } catch {
    return [...defaultCharts];
  }
}

export function saveCharts(charts: Chart[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charts));
}

export function generateId(): string {
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
