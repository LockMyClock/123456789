import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Chart, Action, TrainingResult } from '../types';
import { ACTION_COLORS, ACTION_LABELS, getCellLabel } from '../types';
import PokerTable from './PokerTable';
import ChartGrid from './ChartGrid';
import CardDisplay from './CardDisplay';
import { dealHandForCell } from '../utils/deck';
import type { Card as CardType } from '../types';

interface TrainingModeProps {
  charts: Chart[];
  onExit: () => void;
}

function pickRandomCell(chart: Chart): { row: number; col: number } | null {
  const filledKeys = Object.keys(chart.cells);
  if (filledKeys.length === 0) return null;
  const key = filledKeys[Math.floor(Math.random() * filledKeys.length)];
  const [r, c] = key.split('-').map(Number);
  return { row: r, col: c };
}

export default function TrainingMode({ charts, onExit }: TrainingModeProps) {
  const [results, setResults] = useState<TrainingResult[]>([]);
  const [currentChart, setCurrentChart] = useState<Chart>(charts[0]);
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [currentCards, setCurrentCards] = useState<[CardType, CardType] | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAction: Action } | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  const dealNewHand = useCallback(() => {
    const chart = charts[Math.floor(Math.random() * charts.length)];
    setCurrentChart(chart);
    const cell = pickRandomCell(chart);
    if (!cell) return;
    setCurrentCell(cell);
    const cards = dealHandForCell(cell.row, cell.col);
    setCurrentCards(cards);
    setFeedback(null);
    setShowChart(false);
  }, [charts]);

  useEffect(() => {
    dealNewHand();
  }, [dealNewHand]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!currentCell || !currentCards || feedback) return;
      const key = `${currentCell.row}-${currentCell.col}`;
      const correctAction = currentChart.cells[key];
      if (!correctAction) return;

      const isCorrect = action === correctAction || (correctAction === 'mixed');
      const label = getCellLabel(currentCell.row, currentCell.col);

      setResults(prev => [
        ...prev,
        { hand: label, correctAction, userAction: action, isCorrect, timestamp: Date.now() },
      ]);

      setFeedback({ correct: isCorrect, correctAction });

      if (isCorrect) {
        setTimeout(() => dealNewHand(), 800);
      } else {
        setShowChart(true);
      }
    },
    [currentCell, currentCards, currentChart, feedback, dealNewHand]
  );

  const handleContinue = useCallback(() => {
    dealNewHand();
  }, [dealNewHand]);

  const stats = useMemo(() => {
    if (results.length === 0) return { total: 0, correct: 0, pct: 0 };
    const correct = results.filter(r => r.isCorrect).length;
    return { total: results.length, correct, pct: Math.round((correct / results.length) * 100) };
  }, [results]);

  const recentWindow = 20;
  const graphData = useMemo(() => {
    if (results.length < 2) return [];
    const points: number[] = [];
    for (let i = 0; i < results.length; i++) {
      const start = Math.max(0, i - recentWindow + 1);
      const w = results.slice(start, i + 1);
      const correct = w.filter(r => r.isCorrect).length;
      points.push(Math.round((correct / w.length) * 100));
    }
    return points;
  }, [results]);

  const highlightKey = currentCell ? `${currentCell.row}-${currentCell.col}` : undefined;
  const actionButtons: Action[] = ['fold', 'call', 'raise', '3bet', '4bet'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Тренировка
          </h2>
          <div style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Рук: <span style={{ color: '#fff', fontWeight: 700 }}>{stats.total}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Верно: <span style={{ color: '#22c55e', fontWeight: 700 }}>{stats.correct}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Точность: <span style={{
                color: stats.pct >= 80 ? '#22c55e' : stats.pct >= 60 ? '#f59e0b' : '#ef4444',
                fontWeight: 800, fontSize: 16,
              }}>{stats.pct}%</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {results.length > 1 && (
            <button onClick={() => setShowGraph(!showGraph)} className="btn-ghost">
              {showGraph ? 'Скрыть график' : 'Показать график'}
            </button>
          )}
          <button onClick={onExit} className="btn-ghost" style={{ color: '#ef4444' }}>Выйти</button>
        </div>
      </div>

      {/* Graph */}
      {showGraph && graphData.length > 1 && (
        <div className="glass-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Точность — скользящее окно {recentWindow} рук
          </div>
          <svg viewBox={`0 0 ${Math.max(graphData.length * 4, 200)} 100`} style={{ width: '100%', height: 80 }}>
            <defs>
              <linearGradient id="graphLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
            {[20, 50, 80].map(y => (
              <line key={y} x1="0" y1={y} x2={graphData.length * 4} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
            ))}
            <polyline fill="none" stroke="url(#graphLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              points={graphData.map((v, i) => `${i * 4},${100 - v}`).join(' ')}
            />
          </svg>
        </div>
      )}

      {/* Main area */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Scenario label */}
          <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            <span style={{ color: '#22c55e' }}>{currentChart.name}</span>
            <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span>{currentChart.position}</span>
            {currentChart.vsPosition && <span style={{ color: '#ef4444' }}> vs {currentChart.vsPosition}</span>}
          </div>

          {/* Table */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <PokerTable
              heroPosition={currentChart.position}
              villainPosition={currentChart.vsPosition}
              highlightHero={!feedback}
            />
          </div>

          {/* Cards — single set, large */}
          {currentCards && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 8 }}>
              <CardDisplay card={currentCards[0]} size="xl" />
              <CardDisplay card={currentCards[1]} size="xl" />
              {currentCell && (
                <div style={{
                  marginLeft: 8,
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '1px',
                }}>
                  {getCellLabel(currentCell.row, currentCell.col)}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              borderRadius: 16,
              background: feedback.correct
                ? 'rgba(34,197,94,0.1)'
                : 'rgba(239,68,68,0.1)',
              border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                fontSize: 28,
                fontWeight: 900,
                color: feedback.correct ? '#22c55e' : '#ef4444',
                textShadow: `0 0 20px ${feedback.correct ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              }}>
                {feedback.correct ? 'Верно!' : 'Неверно'}
              </div>
              {!feedback.correct && (
                <>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>
                    Правильный ответ: <span style={{
                      fontWeight: 800,
                      color: '#fff',
                      padding: '2px 10px',
                      borderRadius: 6,
                      background: ACTION_COLORS[feedback.correctAction],
                    }}>
                      {ACTION_LABELS[feedback.correctAction]}
                    </span>
                  </div>
                  <button onClick={handleContinue} className="btn-neon" style={{ marginTop: 4 }}>
                    Продолжить →
                  </button>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!feedback && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {actionButtons.map(action => (
                <button
                  key={action}
                  onClick={() => handleAction(action)}
                  style={{
                    background: ACTION_COLORS[action],
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px 28px',
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: `0 4px 20px ${ACTION_COLORS[action]}44`,
                    letterSpacing: '0.5px',
                    minWidth: 80,
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {ACTION_LABELS[action]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart reference */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!feedback?.correct && feedback && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
              Ваша рука на чарте ↓
            </div>
          )}
          {(showChart || (feedback && !feedback.correct)) && (
            <ChartGrid
              cells={currentChart.cells}
              readOnly
              highlightCell={highlightKey}
              compact
            />
          )}
          {!showChart && !(feedback && !feedback.correct) && (
            <button onClick={() => setShowChart(true)} className="btn-ghost" style={{ fontSize: 12 }}>
              Показать чарт
            </button>
          )}
        </div>
      </div>

      {/* Recent results */}
      {results.length > 0 && (
        <div className="glass-panel" style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Последние руки
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {results.slice(-30).reverse().map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: r.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: r.isCorrect ? '#22c55e' : '#ef4444',
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${r.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
                title={`${r.hand}: ${ACTION_LABELS[r.userAction]} (верно: ${ACTION_LABELS[r.correctAction]})`}
              >
                {r.hand}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
