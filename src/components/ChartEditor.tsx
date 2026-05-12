import { useState } from 'react';
import type { Chart, Action, Position, Scenario } from '../types';
import { POSITIONS, SCENARIOS } from '../types';
import ChartGrid from './ChartGrid';
import BrushPalette from './BrushPalette';
import { generateId } from '../utils/storage';

interface ChartEditorProps {
  chart?: Chart;
  onSave: (chart: Chart) => void;
  onCancel: () => void;
}

const SECTIONS = ['Open', 'BB Defense', '3-Bet', 'vs 3-Bet', '4-Bet', 'vs 4-Bet', 'Custom'];

export default function ChartEditor({ chart, onSave, onCancel }: ChartEditorProps) {
  const [name, setName] = useState(chart?.name || '');
  const [section, setSection] = useState(chart?.section || 'Open');
  const [position, setPosition] = useState<Position>(chart?.position || 'UTG');
  const [scenario, setScenario] = useState<Scenario>(chart?.scenario || 'Open');
  const [vsPosition, setVsPosition] = useState<Position | undefined>(chart?.vsPosition);
  const [cells, setCells] = useState<Record<string, Action>>(chart?.cells || {});
  const [brush, setBrush] = useState<Action>('raise');

  const handleCellChange = (key: string, action: Action | null) => {
    setCells(prev => {
      const next = { ...prev };
      if (action === null) delete next[key];
      else next[key] = action;
      return next;
    });
  };

  const handleSave = () => {
    const now = Date.now();
    onSave({
      id: chart?.id || generateId(),
      name: name || `${position} ${scenario}`,
      section, position, scenario,
      vsPosition: scenario.includes('vs') || scenario === 'BB Defense' ? vsPosition : undefined,
      cells, createdAt: chart?.createdAt || now, updatedAt: now,
    });
  };

  const handleClear = () => setCells({});
  const total = 169;
  const filled = Object.keys(cells).length;
  const pct = ((filled / total) * 100).toFixed(1);

  const inputCls = 'w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-semibold outline-none transition-all focus:border-emerald-400/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)]';

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex gap-6 flex-wrap items-start">
        {/* Settings panel */}
        <div className="bg-gray-900/80 border border-gray-700/30 rounded-xl p-5 flex flex-col gap-4 min-w-[260px] backdrop-blur-sm">
          <div className="font-display text-base font-black tracking-[2px] text-amber-400">
            {chart ? 'EDIT CHART' : 'NEW CHART'}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 font-bold tracking-[2px] uppercase font-display">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="UTG Open" className={inputCls} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold tracking-[2px] uppercase font-display">Section</label>
              <select value={section} onChange={e => setSection(e.target.value)} className={inputCls}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold tracking-[2px] uppercase font-display">Position</label>
              <select value={position} onChange={e => setPosition(e.target.value as Position)} className={inputCls}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 font-bold tracking-[2px] uppercase font-display">Scenario</label>
              <select value={scenario} onChange={e => setScenario(e.target.value as Scenario)} className={inputCls}>
                {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(scenario.includes('vs') || scenario === 'BB Defense') && (
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 font-bold tracking-[2px] uppercase font-display">vs Position</label>
                <select value={vsPosition || ''} onChange={e => setVsPosition(e.target.value as Position)} className={inputCls}>
                  <option value="">—</option>
                  {POSITIONS.filter(p => p !== position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
            <div className="flex justify-between text-xs mb-1.5 font-display tracking-wider">
              <span className="text-gray-500">FILLED</span>
              <span>
                <span className="text-emerald-400 font-black">{filled}</span>
                <span className="text-gray-600"> / {total} ({pct}%)</span>
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-white/[0.04] overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl font-display font-black tracking-wider text-xs text-black cursor-pointer transition-transform hover:-translate-y-0.5 border-0"
              style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
              SAVE
            </button>
            <button onClick={handleClear}
              className="px-3 py-2.5 rounded-lg text-xs font-bold bg-white/5 text-amber-400 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              CLEAR
            </button>
            <button onClick={onCancel}
              className="px-3 py-2.5 rounded-lg text-xs font-bold bg-white/5 text-gray-400 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              CANCEL
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-3">
          <BrushPalette currentBrush={brush} onBrushChange={setBrush} />
          <ChartGrid cells={cells} onCellChange={handleCellChange} currentBrush={brush} />
        </div>
      </div>
    </div>
  );
}
