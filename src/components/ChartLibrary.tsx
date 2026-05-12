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
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setCollapsed(prev => { const n = new Set(prev); if (n.has(section)) n.delete(section); else n.add(section); return n; });
  }, []);

  const toggleSectionSelect = useCallback((section: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const sc = sections.get(section);
    if (!sc) return;
    const ids = sc.map(c => c.id);
    const all = ids.every(id => selected.has(id));
    setSelected(prev => {
      const n = new Set(prev);
      if (all) ids.forEach(id => n.delete(id));
      else ids.forEach(id => n.add(id));
      return n;
    });
  }, [sections, selected]);

  const selectAll = useCallback(() => {
    const all = charts.map(c => c.id);
    const allSel = all.every(id => selected.has(id));
    setSelected(allSel ? new Set() : new Set(all));
  }, [charts, selected]);

  const allSelected = charts.length > 0 && charts.every(c => selected.has(c.id));

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/80 backdrop-blur-sm border border-gray-700/30 rounded-xl px-5 py-3">
        <div className="font-display text-lg font-black tracking-[3px] text-emerald-400">CHART LIBRARY</div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors font-display tracking-wider cursor-pointer">
            {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
          </button>
          <button onClick={onNewChart} className="px-3 py-1.5 text-xs font-bold rounded-lg text-white border border-blue-500/30 hover:bg-blue-500/10 transition-colors font-display tracking-wider cursor-pointer"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))' }}>
            + NEW CHART
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => onStartTraining(Array.from(selected))}
              className="px-4 py-1.5 text-xs font-black rounded-lg text-black font-display tracking-wider cursor-pointer transition-transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                animation: 'neonBreathe 2.5s ease-in-out infinite',
              }}
            >
              TRAIN ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      {Array.from(sections.entries()).map(([section, sectionCharts]) => {
        const isCol = collapsed.has(section);
        const ids = sectionCharts.map(c => c.id);
        const selCount = ids.filter(id => selected.has(id)).length;
        const allSel = selCount === ids.length;
        const partial = selCount > 0 && !allSel;

        return (
          <div key={section} className="bg-gray-900/60 border border-gray-700/20 rounded-xl overflow-visible">
            <div
              onClick={() => toggleSection(section)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              style={{ borderBottom: isCol ? 'none' : '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-3">
                {/* Section checkbox */}
                <div
                  onClick={(e) => toggleSectionSelect(section, e)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-sm font-black cursor-pointer transition-all shrink-0 ${
                    allSel ? 'border-emerald-400 bg-emerald-500/15 text-emerald-400' :
                    partial ? 'border-amber-400 bg-amber-400/10 text-amber-400' :
                    'border-gray-600 bg-transparent text-transparent'
                  }`}
                >
                  {allSel ? '✓' : partial ? '−' : ''}
                </div>

                <span className={`text-xs transition-transform duration-200 ${isCol ? '-rotate-90' : ''} text-gray-500`}>▼</span>

                <span className="font-display text-sm font-black tracking-[2px] text-white uppercase">{section}</span>
                <span className="text-xs text-gray-600 font-display tracking-wider">{sectionCharts.length}</span>
              </div>

              {selCount > 0 && (
                <span className="text-xs text-emerald-400 font-bold font-display tracking-wider">{selCount}/{sectionCharts.length}</span>
              )}
            </div>

            <AnimatePresence>
              {!isCol && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(135px,1fr))] gap-2.5 p-3 pt-1">
                    {sectionCharts.map(chart => {
                      const chk = selected.has(chart.id);
                      return (
                        <div
                          key={chart.id}
                          onClick={() => toggleChart(chart.id)}
                          className={`rounded-xl p-2.5 cursor-pointer transition-all border ${
                            chk ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.04] hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center text-[9px] font-black shrink-0 ${
                              chk ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400' : 'border-gray-600'
                            }`}>
                              {chk ? '✓' : ''}
                            </div>
                            <span className="text-xs font-bold text-white truncate">{chart.name}</span>
                          </div>
                          <div className="flex justify-center">
                            <ChartGrid cells={chart.cells} readOnly compact />
                          </div>
                          <div className="flex gap-1 mt-2 justify-center">
                            <button
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 border-0 cursor-pointer hover:bg-blue-500/20 transition-colors"
                              onClick={(e) => { e.stopPropagation(); onEdit(chart); }}
                            >Edit</button>
                            <button
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border-0 cursor-pointer hover:bg-red-500/20 transition-colors"
                              onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) onDelete(chart.id); }}
                            >Del</button>
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
        <div className="bg-gray-900/60 border border-gray-700/20 rounded-xl p-10 text-center">
          <div className="font-display text-sm tracking-[3px] text-gray-500">NO CHARTS YET</div>
          <button onClick={onNewChart} className="mt-4 px-6 py-2.5 rounded-xl font-display font-black tracking-wider text-sm text-black cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}>
            CREATE FIRST CHART
          </button>
        </div>
      )}
    </div>
  );
}
