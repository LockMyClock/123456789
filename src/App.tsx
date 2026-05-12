import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Chart } from './types';
import { loadCharts, saveCharts } from './utils/storage';
import ChartLibrary from './components/ChartLibrary';
import ChartEditor from './components/ChartEditor';
import TrainingMode from './components/TrainingMode';

type View = 'library' | 'editor' | 'training';

function App() {
  const [charts, setCharts] = useState<Chart[]>(() => loadCharts());
  const [view, setView] = useState<View>('library');
  const [editingChart, setEditingChart] = useState<Chart | undefined>();
  const [trainingChartIds, setTrainingChartIds] = useState<string[]>([]);

  useEffect(() => { saveCharts(charts); }, [charts]);

  const handleSaveChart = useCallback((chart: Chart) => {
    setCharts(prev => {
      const idx = prev.findIndex(c => c.id === chart.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = chart; return next; }
      return [...prev, chart];
    });
    setView('library');
    setEditingChart(undefined);
  }, []);

  const handleDeleteChart = useCallback((id: string) => { setCharts(prev => prev.filter(c => c.id !== id)); }, []);
  const handleEdit = useCallback((chart: Chart) => { setEditingChart(chart); setView('editor'); }, []);
  const handleNewChart = useCallback(() => { setEditingChart(undefined); setView('editor'); }, []);
  const handleStartTraining = useCallback((ids: string[]) => { setTrainingChartIds(ids); setView('training'); }, []);

  const trainingCharts = charts.filter(c => trainingChartIds.includes(c.id));

  return (
    <div className="min-h-screen relative" style={{ background: '#0a0e14' }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.04) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(59,130,246,0.03) 0%, transparent 50%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-3 pb-10">
        {/* Nav */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center bg-gray-900/80 backdrop-blur-sm border border-gray-700/30 rounded-xl px-5 py-2.5 mb-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-black text-base font-display"
              style={{
                background: 'linear-gradient(135deg, #34d399, #10b981)',
                boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              }}
            >P</div>
            <div>
              <div className="font-display text-sm font-black tracking-[2px] text-white leading-tight">PREFLOP TRAINER</div>
              <div className="font-display text-[9px] font-semibold tracking-[3px] text-emerald-400/50">6-MAX NL CASH</div>
            </div>
          </div>
          <div className="flex gap-1">
            {(['library', 'editor'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setView(v); if (v === 'library') setEditingChart(undefined); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 font-display cursor-pointer border ${
                  view === v
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {v === 'library' ? 'Library' : 'Editor'}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'library' && (
            <motion.div key="lib" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <ChartLibrary charts={charts} onEdit={handleEdit} onDelete={handleDeleteChart} onStartTraining={handleStartTraining} onNewChart={handleNewChart} />
            </motion.div>
          )}
          {view === 'editor' && (
            <motion.div key="ed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <ChartEditor chart={editingChart} onSave={handleSaveChart} onCancel={() => { setView('library'); setEditingChart(undefined); }} />
            </motion.div>
          )}
          {view === 'training' && trainingCharts.length > 0 && (
            <motion.div key="tr" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }}>
              <TrainingMode charts={trainingCharts} onExit={() => setView('library')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
