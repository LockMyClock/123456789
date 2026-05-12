import { useState, useMemo } from 'react';
import type { Chart } from '../types';
import { ACTION_COLORS, RANKS, getCellLabel } from '../types';

interface ChartLibraryProps {
  charts: Chart[];
  onEdit: (chart: Chart) => void;
  onDelete: (id: string) => void;
  onStartTraining: (chartIds: string[]) => void;
  onNewChart: () => void;
}

function MiniChart({ cells }: { cells: Record<string, import('../types').Action> }) {
  const size = 8;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(13, ${size}px)`,
      gap: 0.5,
      background: 'rgba(0,0,0,0.3)',
      padding: 1,
      borderRadius: 4,
    }}>
      {RANKS.map((_, row) =>
        RANKS.map((__, col) => {
          const key = `${row}-${col}`;
          const action = cells[key];
          const bg = action ? (action === 'mixed' ? '#f59e0b' : ACTION_COLORS[action]) : 'rgba(255,255,255,0.03)';
          return (
            <div
              key={key}
              title={getCellLabel(row, col)}
              style={{
                width: size,
                height: size,
                background: bg,
                borderRadius: 1,
              }}
            />
          );
        })
      )}
    </div>
  );
}

export default function ChartLibrary({ charts, onEdit, onDelete, onStartTraining, onNewChart }: ChartLibraryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const sections = useMemo(() => {
    const map = new Map<string, Chart[]>();
    for (const chart of charts) {
      const sec = chart.section || 'Custom';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(chart);
    }
    return map;
  }, [charts]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === charts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(charts.map(c => c.id)));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 22, color: '#e2e8f0' }}>
          Библиотека чартов
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={selectAll} style={actionBtn('#374151')}>
            {selected.size === charts.length ? 'Снять всё' : 'Выбрать всё'}
          </button>
          <button onClick={onNewChart} style={actionBtn('#3b82f6')}>
            + Новый чарт
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => onStartTraining(Array.from(selected))}
              style={{
                ...actionBtn('#22c55e'),
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              Тренировать выбранные ({selected.size})
            </button>
          )}
        </div>
      </div>

      {Array.from(sections.entries()).map(([section, sectionCharts]) => {
        const isCollapsed = collapsedSections.has(section);
        const sectionSelected = sectionCharts.filter(c => selected.has(c.id)).length;

        return (
          <div key={section} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <div
              onClick={() => toggleSection(section)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  ▼
                </span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{section}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  ({sectionCharts.length})
                </span>
              </div>
              {sectionSelected > 0 && (
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                  Выбрано: {sectionSelected}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
                padding: 12,
              }}>
                {sectionCharts.map(chart => {
                  const isSelected = selected.has(chart.id);
                  return (
                    <div
                      key={chart.id}
                      style={{
                        background: isSelected
                          ? 'rgba(34,197,94,0.1)'
                          : 'rgba(255,255,255,0.04)',
                        border: isSelected
                          ? '2px solid rgba(34,197,94,0.5)'
                          : '2px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleSelect(chart.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: `2px solid ${isSelected ? '#22c55e' : 'rgba(255,255,255,0.3)'}`,
                            background: isSelected ? '#22c55e' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: '#fff',
                            transition: 'all 0.15s',
                          }}>
                            {isSelected && '✓'}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                            {chart.name}
                          </span>
                        </div>
                      </div>

                      <MiniChart cells={chart.cells} />

                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          onClick={e => { e.stopPropagation(); onEdit(chart); }}
                          style={smallBtn('#3b82f6')}
                        >
                          Ред.
                        </button>
                        {!chart.id.startsWith('default-') && (
                          <button
                            onClick={e => { e.stopPropagation(); onDelete(chart.id); }}
                            style={smallBtn('#ef4444')}
                          >
                            Удл.
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  };
}

function smallBtn(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  };
}
