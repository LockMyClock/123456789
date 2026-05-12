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
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '10px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  outline: 'none',
  transition: 'border-color 0.2s',
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
      section, position, scenario,
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

  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 700,
    fontFamily: 'var(--font-display)', letterSpacing: '2px', textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Settings */}
        <div className="hud-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 260 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, letterSpacing: '2px',
            color: '#ffaa00',
          }}>
            {chart ? 'EDIT CHART' : 'NEW CHART'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={labelStyle}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="UTG Open" style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Section</label>
              <select value={section} onChange={e => setSection(e.target.value)} style={inputStyle}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Position</label>
              <select value={position} onChange={e => setPosition(e.target.value as Position)} style={inputStyle}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={labelStyle}>Scenario</label>
              <select value={scenario} onChange={e => setScenario(e.target.value as Scenario)} style={inputStyle}>
                {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(scenario.includes('vs') || scenario === 'BB Defense') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={labelStyle}>vs Position</label>
                <select value={vsPosition || ''} onChange={e => setVsPosition(e.target.value as Position)} style={inputStyle}>
                  <option value="">—</option>
                  {POSITIONS.filter(p => p !== position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>FILLED</span>
              <span><span style={{ color: '#00ff88', fontWeight: 800 }}>{filledCells}</span><span style={{ color: 'rgba(255,255,255,0.2)' }}> / {totalCells} ({pct}%)</span></span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00ff88, #00aaff)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} className="btn-neon" style={{ flex: 1, padding: '10px', fontSize: 13 }}>SAVE</button>
            <button onClick={handleClear} className="btn-ghost" style={{ color: '#ffaa00' }}>CLEAR</button>
            <button onClick={onCancel} className="btn-ghost">CANCEL</button>
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
