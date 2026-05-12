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

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '9px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
};

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
      section,
      position,
      scenario,
      vsPosition: scenario.includes('vs') || scenario === 'BB Defense' ? vsPosition : undefined,
      cells,
      createdAt: chart?.createdAt || now,
      updatedAt: now,
    });
  };

  const handleClear = () => setCells({});
  const totalCells = 169;
  const filledCells = Object.keys(cells).length;
  const pct = ((filledCells / totalCells) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Settings */}
        <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 260 }}>
          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 900,
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {chart ? 'Редактировать' : 'Новый чарт'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Название</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="UTG Open" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Раздел</label>
              <select value={section} onChange={e => setSection(e.target.value)} style={inputStyle}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Позиция</label>
              <select value={position} onChange={e => setPosition(e.target.value as Position)} style={inputStyle}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Сценарий</label>
              <select value={scenario} onChange={e => setScenario(e.target.value as Scenario)} style={inputStyle}>
                {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(scenario.includes('vs') || scenario === 'BB Defense') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>vs Позиция</label>
                <select value={vsPosition || ''} onChange={e => setVsPosition(e.target.value as Position)} style={inputStyle}>
                  <option value="">—</option>
                  {POSITIONS.filter(p => p !== position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Progress */}
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Заполнено</span>
              <span><span style={{ color: '#22c55e', fontWeight: 700 }}>{filledCells}</span> / {totalCells} <span style={{ color: 'rgba(255,255,255,0.3)' }}>({pct}%)</span></span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #22c55e, #3b82f6)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} className="btn-neon" style={{ flex: 1, padding: '10px' }}>Сохранить</button>
            <button onClick={handleClear} className="btn-ghost" style={{ color: '#f59e0b' }}>Очистить</button>
            <button onClick={onCancel} className="btn-ghost">Отмена</button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BrushPalette currentBrush={brush} onBrushChange={setBrush} />
          <ChartGrid cells={cells} onCellChange={handleCellChange} currentBrush={brush} />
        </div>
      </div>
    </div>
  );
}
