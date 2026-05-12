import { useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    saveCharts(charts);
  }, [charts]);

  const handleSaveChart = useCallback((chart: Chart) => {
    setCharts(prev => {
      const idx = prev.findIndex(c => c.id === chart.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = chart;
        return next;
      }
      return [...prev, chart];
    });
    setView('library');
    setEditingChart(undefined);
  }, []);

  const handleDeleteChart = useCallback((id: string) => {
    setCharts(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleEdit = useCallback((chart: Chart) => {
    setEditingChart(chart);
    setView('editor');
  }, []);

  const handleNewChart = useCallback(() => {
    setEditingChart(undefined);
    setView('editor');
  }, []);

  const handleStartTraining = useCallback((chartIds: string[]) => {
    setTrainingChartIds(chartIds);
    setView('training');
  }, []);

  const trainingCharts = charts.filter(c => trainingChartIds.includes(c.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      color: '#e2e8f0',
    }}>
      {/* Background effects */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(circle at 15% 25%, rgba(34,197,94,0.04) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(59,130,246,0.04) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(168,85,247,0.02) 0%, transparent 60%)',
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.015,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '12px 16px 32px' }}>
        {/* Navigation */}
        <nav className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          padding: '10px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo */}
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900,
              boxShadow: '0 0 20px rgba(34,197,94,0.3)',
            }}>P</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Preflop Trainer
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
                6-MAX NL CASH
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 3 }}>
            {(['library', 'editor'] as const).map(v => (
              <button
                key={v}
                onClick={() => { setView(v); if (v === 'library') setEditingChart(undefined); }}
                style={{
                  background: view === v ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: view === v ? '#22c55e' : 'rgba(255,255,255,0.5)',
                  border: view === v ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {v === 'library' ? 'Библиотека' : 'Редактор'}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {view === 'library' && (
            <ChartLibrary
              charts={charts}
              onEdit={handleEdit}
              onDelete={handleDeleteChart}
              onStartTraining={handleStartTraining}
              onNewChart={handleNewChart}
            />
          )}

          {view === 'editor' && (
            <ChartEditor
              chart={editingChart}
              onSave={handleSaveChart}
              onCancel={() => { setView('library'); setEditingChart(undefined); }}
            />
          )}

          {view === 'training' && trainingCharts.length > 0 && (
            <TrainingMode
              charts={trainingCharts}
              onExit={() => setView('library')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
