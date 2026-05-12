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
        {
          hand: label,
          correctAction,
          userAction: action,
          isCorrect,
          timestamp: Date.now(),
        },
      ]);

      setFeedback({ correct: isCorrect, correctAction });

      setTimeout(() => {
        dealNewHand();
      }, 1200);
    },
    [currentCell, currentCards, currentChart, feedback, dealNewHand]
  );

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
      const window = results.slice(start, i + 1);
      const correct = window.filter(r => r.isCorrect).length;
      points.push(Math.round((correct / window.length) * 100));
    }
    return points;
  }, [results]);

  const highlightKey = currentCell ? `${currentCell.row}-${currentCell.col}` : undefined;

  const actionButtons: Action[] = ['fold', 'call', 'raise', '3bet', '4bet'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: '#e2e8f0' }}>Тренировка</h2>
          <div style={{ display: 'flex', gap: 12, fontSize: 14 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Рук: <span style={{ color: '#fff', fontWeight: 700 }}>{stats.total}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Верно: <span style={{ color: '#22c55e', fontWeight: 700 }}>{stats.correct}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>
              Точность: <span style={{
                color: stats.pct >= 80 ? '#22c55e' : stats.pct >= 60 ? '#f59e0b' : '#ef4444',
                fontWeight: 700,
              }}>{stats.pct}%</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!showGraph && results.length > 1 && (
            <button onClick={() => setShowGraph(true)} style={controlBtn('#374151')}>
              Показать график
            </button>
          )}
          {showGraph && (
            <button onClick={() => setShowGraph(false)} style={controlBtn('#374151')}>
              Скрыть график
            </button>
          )}
          <button onClick={onExit} style={controlBtn('#64748b')}>
            Выйти
          </button>
        </div>
      </div>

      {/* Graph */}
      {showGraph && graphData.length > 1 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            Точность (скользящее окно {recentWindow} рук)
          </div>
          <svg viewBox={`0 0 ${Math.max(graphData.length * 4, 200)} 100`} style={{ width: '100%', height: 80 }}>
            <line x1="0" y1="20" x2={graphData.length * 4} y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="3" />
            <line x1="0" y1="50" x2={graphData.length * 4} y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="3" />
            <line x1="0" y1="80" x2={graphData.length * 4} y2="80" stroke="rgba(255,255,255,0.1)" strokeDasharray="3" />
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              points={graphData.map((v, i) => `${i * 4},${100 - v}`).join(' ')}
            />
          </svg>
        </div>
      )}

      {/* Main training area */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Table + Cards + Actions */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8, textAlign: 'center' }}>
              {currentChart.name} | {currentChart.position}
              {currentChart.vsPosition ? ` vs ${currentChart.vsPosition}` : ''}
            </div>
            <PokerTable
              heroPosition={currentChart.position}
              villainPosition={currentChart.vsPosition}
              heroCards={currentCards || undefined}
              highlightHero={!feedback}
            />
          </div>

          {/* Hero cards large */}
          {currentCards && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              padding: 12,
            }}>
              <CardDisplay card={currentCards[0]} size="lg" />
              <CardDisplay card={currentCards[1]} size="lg" />
              {currentCell && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 12,
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.6)',
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
              padding: 16,
              borderRadius: 12,
              background: feedback.correct
                ? 'rgba(34,197,94,0.15)'
                : 'rgba(239,68,68,0.15)',
              border: `2px solid ${feedback.correct ? '#22c55e' : '#ef4444'}`,
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: feedback.correct ? '#22c55e' : '#ef4444' }}>
                {feedback.correct ? 'Верно!' : 'Неверно'}
              </div>
              {!feedback.correct && (
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                  Правильный ответ: <span style={{ fontWeight: 700, color: '#fff' }}>
                    {ACTION_LABELS[feedback.correctAction]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {actionButtons.map(action => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={!!feedback}
                style={{
                  background: feedback ? 'rgba(255,255,255,0.05)' : ACTION_COLORS[action],
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 28px',
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: feedback ? 'not-allowed' : 'pointer',
                  opacity: feedback ? 0.4 : 1,
                  transition: 'all 0.15s',
                  boxShadow: feedback ? 'none' : '0 4px 15px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px',
                  minWidth: 80,
                }}
              >
                {ACTION_LABELS[action]}
              </button>
            ))}
          </div>
        </div>

        {/* Chart reference (toggleable) */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setShowChart(!showChart)}
            style={controlBtn('#374151')}
          >
            {showChart ? 'Скрыть чарт' : 'Показать чарт'}
          </button>
          {showChart && (
            <ChartGrid
              cells={currentChart.cells}
              readOnly
              highlightCell={highlightKey}
              compact
            />
          )}
        </div>
      </div>

      {/* Recent results */}
      {results.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          padding: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            Последние руки
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {results.slice(-30).reverse().map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: r.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  color: r.isCorrect ? '#22c55e' : '#ef4444',
                  fontSize: 12,
                  fontWeight: 600,
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

function controlBtn(bg: string): React.CSSProperties {
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
