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

  const handleDeleteChart = useCallback((id: string) => {
    setCharts(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleEdit = useCallback((chart: Chart) => { setEditingChart(chart); setView('editor'); }, []);
  const handleNewChart = useCallback(() => { setEditingChart(undefined); setView('editor'); }, []);
  const handleStartTraining = useCallback((chartIds: string[]) => { setTrainingChartIds(chartIds); setView('training'); }, []);

  const trainingCharts = charts.filter(c => trainingChartIds.includes(c.id));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', position: 'relative' }}>
      {/* Animated background layers */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,255,136,0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,170,255,0.03) 0%, transparent 50%), radial-gradient(ellipse 40% 60% at 10% 60%, rgba(168,85,247,0.02) 0%, transparent 50%)',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.02,
          backgroundImage: 'linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        {/* Scanline */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '200px', opacity: 0.015,
          background: 'linear-gradient(180deg, transparent, rgba(0,255,136,0.5), transparent)',
          animation: 'scanline 8s linear infinite',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '12px 16px 40px' }}>
        {/* Nav */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="hud-panel"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #00ff88, #00cc66)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, color: '#000',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 25px rgba(0,255,136,0.4)',
            }}>P</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '2px', lineHeight: 1.1 }}>
                PREFLOP TRAINER
              </div>
              <div style={{ fontSize: 10, color: 'rgba(0,255,136,0.5)', fontWeight: 600, letterSpacing: '3px', fontFamily: 'var(--font-display)' }}>
                6-MAX NL CASH
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {(['library', 'editor'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setView(v); if (v === 'library') setEditingChart(undefined); }}
                style={{
                  background: view === v ? 'rgba(0,255,136,0.1)' : 'transparent',
                  color: view === v ? '#00ff88' : 'rgba(255,255,255,0.4)',
                  border: view === v ? '1px solid rgba(0,255,136,0.25)' : '1px solid transparent',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {v === 'library' ? 'Library' : 'Editor'}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === 'library' && (
            <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ChartLibrary charts={charts} onEdit={handleEdit} onDelete={handleDeleteChart} onStartTraining={handleStartTraining} onNewChart={handleNewChart} />
            </motion.div>
          )}
          {view === 'editor' && (
            <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ChartEditor chart={editingChart} onSave={handleSaveChart} onCancel={() => { setView('library'); setEditingChart(undefined); }} />
            </motion.div>
          )}
          {view === 'training' && trainingCharts.length > 0 && (
            <motion.div key="training" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <TrainingMode charts={trainingCharts} onExit={() => setView('library')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
