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
  const size = 7;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(13, ${size}px)`,
      gap: 0.5,
      background: 'rgba(0,0,0,0.4)',
      padding: 1,
      borderRadius: 6,
    }}>
      {RANKS.map((_, row) =>
        RANKS.map((__, col) => {
          const key = `${row}-${col}`;
          const action = cells[key];
          const bg = action ? (action === 'mixed' ? '#f59e0b' : ACTION_COLORS[action]) : 'rgba(255,255,255,0.02)';
          return (
            <div
              key={key}
              title={getCellLabel(row, col)}
              style={{ width: size, height: size, background: bg, borderRadius: 1 }}
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

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCollapse = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleSectionSelect = (section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sectionCharts = sections.get(section);
    if (!sectionCharts) return;
    const sectionIds = sectionCharts.map(c => c.id);
    const allSelected = sectionIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) {
        sectionIds.forEach(id => next.delete(id));
      } else {
        sectionIds.forEach(id => next.add(id));
      }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '14px 20px' }}>
        <h2 style={{
          margin: 0, fontSize: 24, fontWeight: 900,
          background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Библиотека чартов
        </h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={selectAll} className="btn-ghost">
            {selected.size === charts.length ? 'Снять всё' : 'Выбрать всё'}
          </button>
          <button onClick={onNewChart} className="btn-accent">
            + Новый чарт
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => onStartTraining(Array.from(selected))}
              className="btn-neon"
            >
              Тренировать ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      {Array.from(sections.entries()).map(([section, sectionCharts]) => {
        const isCollapsed = collapsedSections.has(section);
        const sectionIds = sectionCharts.map(c => c.id);
        const sectionSelectedCount = sectionIds.filter(id => selected.has(id)).length;
        const allSectionSelected = sectionSelectedCount === sectionIds.length;
        const partialSelected = sectionSelectedCount > 0 && !allSectionSelected;

        return (
          <div key={section} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Section header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
                transition: 'background 0.15s',
              }}
              onClick={() => toggleCollapse(section)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Section checkbox */}
                <div
                  onClick={(e) => toggleSectionSelect(section, e)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: `2px solid ${allSectionSelected ? '#22c55e' : partialSelected ? '#f59e0b' : 'rgba(255,255,255,0.25)'}`,
                    background: allSectionSelected ? '#22c55e' : partialSelected ? 'rgba(245,158,11,0.3)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {allSectionSelected ? '✓' : partialSelected ? '−' : ''}
                </div>
                <span style={{
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s',
                  display: 'inline-block',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.4)',
                }}>
                  ▼
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.3px' }}>{section}</span>
                <span style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '2px 8px',
                  borderRadius: 8,
                  fontWeight: 600,
                }}>
                  {sectionCharts.length}
                </span>
              </div>
              {sectionSelectedCount > 0 && (
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>
                  Выбрано: {sectionSelectedCount}/{sectionCharts.length}
                </span>
              )}
            </div>

            {/* Cards grid */}
            {!isCollapsed && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 10,
                padding: 12,
              }}>
                {sectionCharts.map(chart => {
                  const isSelected = selected.has(chart.id);
                  return (
                    <div
                      key={chart.id}
                      onClick={(e) => toggleSelect(chart.id, e)}
                      style={{
                        background: isSelected ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `2px solid ${isSelected ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
                            background: isSelected ? '#22c55e' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: '#fff',
                            transition: 'all 0.15s',
                            flexShrink: 0,
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
                          className="btn-tiny"
                          style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}
                        >
                          Ред.
                        </button>
                        {!chart.id.startsWith('default-') && (
                          <button
                            onClick={e => { e.stopPropagation(); onDelete(chart.id); }}
                            className="btn-tiny"
                            style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
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
