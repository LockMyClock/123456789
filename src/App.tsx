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
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0f172a 40%, #0a0a1a 100%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Animated background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 30%, rgba(59,130,246,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168,85,247,0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '16px 20px' }}>
        {/* Navigation */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 900,
              boxShadow: '0 0 20px rgba(34,197,94,0.3)',
            }}>
              P
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Preflop Trainer
            </span>
            <span style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.06)',
              padding: '2px 8px',
              borderRadius: 6,
              fontWeight: 600,
            }}>
              6-MAX NL
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <NavButton
              active={view === 'library'}
              onClick={() => { setView('library'); setEditingChart(undefined); }}
            >
              Библиотека
            </NavButton>
            <NavButton
              active={view === 'editor'}
              onClick={() => { setView('editor'); }}
            >
              Редактор
            </NavButton>
          </div>
        </nav>

        {/* Content */}
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
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(34,197,94,0.15)' : 'transparent',
        color: active ? '#22c55e' : 'rgba(255,255,255,0.6)',
        border: active ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
        borderRadius: 8,
        padding: '8px 16px',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

export default App;
