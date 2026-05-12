import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chart } from '../types';
import ChartGrid from './ChartGrid';

interface ChartLibraryProps {
  charts: Chart[];
  onEdit: (chart: Chart) => void;
  onDelete: (id: string) => void;
  onStartTraining: (chartIds: string[]) => void;
  onNewChart: () => void;
}

export default function ChartLibrary({ charts, onEdit, onDelete, onStartTraining, onNewChart }: ChartLibraryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const sections = useMemo(() => {
    const map = new Map<string, Chart[]>();
    charts.forEach(c => {
      const list = map.get(c.section) || [];
      list.push(c);
      map.set(c.section, list);
    });
    return map;
  }, [charts]);

  const toggleChart = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const toggleSectionSelect = useCallback((section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sectionCharts = sections.get(section);
    if (!sectionCharts) return;
    const sectionIds = sectionCharts.map(c => c.id);
    const allSelected = sectionIds.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) sectionIds.forEach(id => next.delete(id));
      else sectionIds.forEach(id => next.add(id));
      return next;
    });
  }, [sections, selected]);

  const selectAll = useCallback(() => {
    const allIds = charts.map(c => c.id);
    const allSelected = allIds.every(id => selected.has(id));
    setSelected(allSelected ? new Set() : new Set(allIds));
  }, [charts, selected]);

  const allSelected = charts.length > 0 && charts.every(c => selected.has(c.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div className="hud-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, letterSpacing: '3px', color: '#00ff88' }}>
          CHART LIBRARY
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={selectAll} className="btn-ghost" style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '1px' }}>
            {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
          </button>
          <button onClick={onNewChart} className="btn-accent" style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '1px' }}>
            + NEW CHART
          </button>
          {selected.size > 0 && (
            <button onClick={() => onStartTraining(Array.from(selected))} className="btn-neon" style={{ fontSize: 12, padding: '10px 20px' }}>
              TRAIN ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      {Array.from(sections.entries()).map(([section, sectionCharts]) => {
        const isCollapsed = collapsed.has(section);
        const sectionIds = sectionCharts.map(c => c.id);
        const sectionSelectedCount = sectionIds.filter(id => selected.has(id)).length;
        const allSectionSelected = sectionSelectedCount === sectionIds.length;
        const partialSelected = sectionSelectedCount > 0 && !allSectionSelected;

        return (
          <div key={section} className="hud-panel" style={{ overflow: 'visible' }}>
            {/* Section header */}
            <div
              onClick={() => toggleSection(section)}
              style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer',
                gap: 12, justifyContent: 'space-between',
                borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Section checkbox */}
                <div
                  onClick={(e) => toggleSectionSelect(section, e)}
                  style={{
                    width: 24, height: 24, borderRadius: 6,
                    border: `2px solid ${allSectionSelected ? '#00ff88' : partialSelected ? '#ffaa00' : 'rgba(255,255,255,0.15)'}`,
                    background: allSectionSelected ? 'rgba(0,255,136,0.15)' : partialSelected ? 'rgba(255,170,0,0.1)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: allSectionSelected ? '#00ff88' : '#ffaa00',
                    fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  {allSectionSelected ? '✓' : partialSelected ? '−' : ''}
                </div>

                <span style={{
                  color: isCollapsed ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontSize: 12, opacity: 0.5,
                  transition: 'transform 0.2s', display: 'inline-block',
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                }}>▼</span>

                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: '#fff',
                  textTransform: 'uppercase',
                }}>
                  {section}
                </span>

                <span style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '1px',
                }}>
                  {sectionCharts.length}
                </span>
              </div>

              {sectionSelectedCount > 0 && (
                <span style={{
                  fontSize: 11,
                  color: '#00ff88',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '1px',
                }}>
                  {sectionSelectedCount}/{sectionCharts.length}
                </span>
              )}
            </div>

            {/* Charts grid */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 10,
                    padding: '12px 16px 16px',
                  }}>
                    {sectionCharts.map(chart => {
                      const isChecked = selected.has(chart.id);
                      return (
                        <div
                          key={chart.id}
                          style={{
                            background: isChecked ? 'rgba(0,255,136,0.04)' : 'rgba(255,255,255,0.02)',
                            borderRadius: 12,
                            padding: '10px 8px 8px',
                            border: `1px solid ${isChecked ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.04)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => toggleChart(chart.id)}
                        >
                          {/* Chart header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{
                                width: 16, height: 16, borderRadius: 4,
                                border: `1.5px solid ${isChecked ? '#00ff88' : 'rgba(255,255,255,0.15)'}`,
                                background: isChecked ? 'rgba(0,255,136,0.2)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 10, color: '#00ff88', fontWeight: 900,
                              }}>
                                {isChecked ? '✓' : ''}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-body)' }}>
                                {chart.name}
                              </span>
                            </div>
                          </div>

                          {/* Mini chart */}
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <ChartGrid cells={chart.cells} readOnly compact />
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
                            <button
                              className="btn-tiny"
                              style={{ background: 'rgba(0,170,255,0.15)', color: '#00aaff' }}
                              onClick={(e) => { e.stopPropagation(); onEdit(chart); }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-tiny"
                              style={{ background: 'rgba(255,51,85,0.1)', color: '#ff3355' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete chart?')) onDelete(chart.id);
                              }}
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {charts.length === 0 && (
        <div className="hud-panel" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '2px', color: 'rgba(255,255,255,0.3)' }}>
            NO CHARTS YET
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={onNewChart} className="btn-neon">CREATE FIRST CHART</button>
          </div>
        </div>
      )}
    </div>
  );
}
