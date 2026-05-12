import { useState } from 'react';
import type { Chart, Action, Position, Scenario } from '../types';
import { POSITIONS, SCENARIOS, generateTrainingCells } from '../types';
import ChartGrid from './ChartGrid';
import BrushPalette from './BrushPalette';
import { generateId } from '../utils/storage';

interface ChartEditorProps {
  chart?: Chart;
  onSave: (chart: Chart) => void;
  onCancel: () => void;
}

const SECTIONS = ['Open', 'BB Defense', '3-Bet', 'vs 3-Bet', '4-Bet', 'vs 4-Bet', 'Custom'];

type EditorTab = 'range' | 'training';

export default function ChartEditor({ chart, onSave, onCancel }: ChartEditorProps) {
  const [name, setName] = useState(chart?.name || '');
  const [section, setSection] = useState(chart?.section || 'Open');
  const [position, setPosition] = useState<Position>(chart?.position || 'UTG');
  const [scenario, setScenario] = useState<Scenario>(chart?.scenario || 'Open');
  const [vsPosition, setVsPosition] = useState<Position | undefined>(chart?.vsPosition);
  const [cells, setCells] = useState<Record<string, Action>>(chart?.cells || {});
  const [trainingCells, setTrainingCells] = useState<Record<string, Action>>(chart?.trainingCells || {});
  const [brush, setBrush] = useState<Action>('raise');
  const [activeTab, setActiveTab] = useState<EditorTab>('range');

  const handleCellChange = (key: string, action: Action | null) => {
    setCells(prev => {
      const next = { ...prev };
      if (action === null) {
        delete next[key];
      } else {
        next[key] = action;
      }
      return next;
    });
  };

  const handleTrainingCellChange = (key: string, action: Action | null) => {
    setTrainingCells(prev => {
      const next = { ...prev };
      if (action === null) {
        delete next[key];
      } else {
        next[key] = action;
      }
      return next;
    });
  };

  const handleAutoTraining = () => {
    setTrainingCells(generateTrainingCells(cells));
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
      trainingCells: Object.keys(trainingCells).length > 0 ? trainingCells : generateTrainingCells(cells),
      createdAt: chart?.createdAt || now,
      updatedAt: now,
    });
  };

  const handleClear = () => {
    if (activeTab === 'range') {
      setCells({});
    } else {
      setTrainingCells({});
    }
  };

  const totalCells = 169;
  const filledCells = Object.keys(cells).length;
  const trainingCount = Object.keys(trainingCells).length;
  const pct = ((filledCells / totalCells) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Settings panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 240 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#e2e8f0' }}>
            {chart ? 'Редактировать чарт' : 'Новый чарт'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Название</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="UTG Open"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Раздел</label>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: 14,
                }}
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Позиция</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value as Position)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: 14,
                }}
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Сценарий</label>
              <select
                value={scenario}
                onChange={e => setScenario(e.target.value as Scenario)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: 14,
                }}
              >
                {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {(scenario.includes('vs') || scenario === 'BB Defense') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>vs Позиция</label>
                <select
                  value={vsPosition || ''}
                  onChange={e => setVsPosition(e.target.value as Position)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  <option value="">—</option>
                  {POSITIONS.filter(p => p !== position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
          </div>

          <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Заполнено: </span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{filledCells}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}> / {totalCells} ({pct}%)</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 6px' }}>|</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Тренировка: </span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{trainingCount}</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={btnStyle('#22c55e')}>Сохранить</button>
            <button onClick={handleClear} style={btnStyle('#f59e0b')}>Очистить</button>
            <button onClick={onCancel} style={btnStyle('#64748b')}>Отмена</button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setActiveTab('range')}
              style={{
                background: activeTab === 'range' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'range' ? '#22c55e' : 'rgba(255,255,255,0.6)',
                border: activeTab === 'range' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Диапазон
            </button>
            <button
              onClick={() => setActiveTab('training')}
              style={{
                background: activeTab === 'training' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'training' ? '#f59e0b' : 'rgba(255,255,255,0.6)',
                border: activeTab === 'training' ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Тренировка ({trainingCount})
            </button>
            {activeTab === 'training' && (
              <button
                onClick={handleAutoTraining}
                style={{
                  background: 'rgba(168,85,247,0.2)',
                  color: '#a855f7',
                  border: '1px solid rgba(168,85,247,0.4)',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Авто (~10%)
              </button>
            )}
          </div>

          <BrushPalette currentBrush={brush} onBrushChange={setBrush} />
          {activeTab === 'range' ? (
            <ChartGrid cells={cells} onCellChange={handleCellChange} currentBrush={brush} />
          ) : (
            <ChartGrid
              cells={trainingCells}
              onCellChange={handleTrainingCellChange}
              currentBrush={brush}
              overlayCells={cells}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  };
}
