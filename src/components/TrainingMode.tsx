import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [handKey, setHandKey] = useState(0);

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
    setHandKey(k => k + 1);
  }, [charts]);

  useEffect(() => { dealNewHand(); }, [dealNewHand]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!currentCell || !currentCards || feedback) return;
      const key = `${currentCell.row}-${currentCell.col}`;
      const correctAction = currentChart.cells[key];
      if (!correctAction) return;

      const isRaise = action === 'raise';
      const correctIsRaise = correctAction !== 'fold';
      const isCorrect = isRaise === correctIsRaise;

      const label = getCellLabel(currentCell.row, currentCell.col);
      setResults(prev => [
        ...prev,
        { hand: label, correctAction, userAction: action, isCorrect, timestamp: Date.now() },
      ]);

      setFeedback({ correct: isCorrect, correctAction });
      if (isCorrect) {
        setTimeout(() => dealNewHand(), 700);
      } else {
        setShowChart(true);
      }
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
      const w = results.slice(start, i + 1);
      const c = w.filter(r => r.isCorrect).length;
      points.push(Math.round((c / w.length) * 100));
    }
    return points;
  }, [results]);

  const highlightKey = currentCell ? `${currentCell.row}-${currentCell.col}` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* HUD Bar */}
      <div className="hud-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, letterSpacing: '2px', color: '#00ff88' }}>
            TRAINING
          </span>
          <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '1px' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>
              HANDS <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>{stats.total}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>
              HIT <span style={{ color: '#00ff88', fontWeight: 800, fontSize: 14 }}>{stats.correct}</span>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>
              ACC <span style={{
                color: stats.pct >= 80 ? '#00ff88' : stats.pct >= 60 ? '#ffaa00' : '#ff3355',
                fontWeight: 900, fontSize: 16,
              }}>{stats.pct}%</span>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {results.length > 1 && (
            <button onClick={() => setShowGraph(!showGraph)} className="btn-ghost" style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '1px' }}>
              {showGraph ? 'HIDE GRAPH' : 'GRAPH'}
            </button>
          )}
          <button onClick={onExit} className="btn-ghost" style={{ color: '#ff3355', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '1px' }}>
            EXIT
          </button>
        </div>
      </div>

      {/* Graph */}
      <AnimatePresence>
        {showGraph && graphData.length > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="hud-panel" style={{ padding: 16, overflow: 'hidden' }}
          >
            <svg viewBox={`0 0 ${Math.max(graphData.length * 4, 200)} 100`} style={{ width: '100%', height: 70 }}>
              <defs>
                <linearGradient id="graphG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff3355" />
                  <stop offset="50%" stopColor="#ffaa00" />
                  <stop offset="100%" stopColor="#00ff88" />
                </linearGradient>
              </defs>
              {[20, 50, 80].map(y => (
                <line key={y} x1="0" y1={y} x2={graphData.length * 4} y2={y} stroke="rgba(0,255,136,0.06)" strokeDasharray="3" />
              ))}
              <polyline fill="none" stroke="url(#graphG)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points={graphData.map((v, i) => `${i * 4},${100 - v}`).join(' ')}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main game area */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Left: game */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          {/* Scenario info */}
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 8, textAlign: 'center',
          }}>
            <span style={{ color: '#00ff88' }}>{currentChart.name}</span>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
            <span>{currentChart.position}</span>
            {currentChart.vsPosition && <span style={{ color: '#ff3355' }}> vs {currentChart.vsPosition}</span>}
          </div>

          {/* Table with cards inside */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
            <PokerTable
              heroPosition={currentChart.position}
              villainPosition={currentChart.vsPosition}
              highlightHero={!feedback}
            />

            {/* Cards centered at bottom of table */}
            <AnimatePresence mode="wait">
              {currentCards && (
                <motion.div
                  key={handKey}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                  style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 8,
                    zIndex: 20,
                  }}
                >
                  <CardDisplay card={currentCards[0]} size="xl" />
                  <CardDisplay card={currentCards[1]} size="xl" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hand label */}
          {currentCell && (
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '3px',
              marginTop: 24,
            }}>
              {getCellLabel(currentCell.row, currentCell.col)}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: 'center',
                  padding: '20px 40px',
                  borderRadius: 16,
                  marginTop: 12,
                  background: feedback.correct
                    ? 'rgba(0,255,136,0.06)'
                    : 'rgba(255,51,85,0.06)',
                  border: `1px solid ${feedback.correct ? 'rgba(0,255,136,0.2)' : 'rgba(255,51,85,0.2)'}`,
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: '3px',
                  color: feedback.correct ? '#00ff88' : '#ff3355',
                  textShadow: `0 0 30px ${feedback.correct ? 'rgba(0,255,136,0.5)' : 'rgba(255,51,85,0.5)'}`,
                }}>
                  {feedback.correct ? 'CORRECT' : 'WRONG'}
                </div>
                {!feedback.correct && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: 'var(--font-body)' }}>
                      Answer:{' '}
                    </span>
                    <span style={{
                      fontWeight: 800, color: '#fff',
                      padding: '3px 12px', borderRadius: 6,
                      background: ACTION_COLORS[feedback.correctAction],
                      fontSize: 13,
                    }}>
                      {ACTION_LABELS[feedback.correctAction]}
                    </span>
                    <div style={{ marginTop: 16 }}>
                      <button
                        onClick={() => dealNewHand()}
                        className="btn-hud btn-raise"
                        style={{ padding: '12px 36px', fontSize: 14 }}
                      >
                        CONTINUE →
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {!feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: 24, marginTop: 16 }}
            >
              <button onClick={() => handleAction('fold')} className="btn-hud btn-fold">
                FOLD
              </button>
              <button onClick={() => handleAction('raise')} className="btn-hud btn-raise">
                RAISE
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: chart (hidden by default) */}
        <div style={{ width: showChart ? 'auto' : 'auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {feedback && !feedback.correct && (
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '2px',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
            }}>
              YOUR HAND ON CHART
            </div>
          )}
          {showChart && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <ChartGrid cells={currentChart.cells} readOnly highlightCell={highlightKey} compact />
            </motion.div>
          )}
          {!showChart && !feedback && (
            <button onClick={() => setShowChart(true)} className="btn-ghost" style={{ fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
              SHOW CHART
            </button>
          )}
        </div>
      </div>

      {/* Recent hands */}
      {results.length > 0 && (
        <div className="hud-panel" style={{ padding: '10px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {results.slice(-30).reverse().map((r, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 7px', borderRadius: 4,
                  background: r.isCorrect ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,85,0.1)',
                  color: r.isCorrect ? '#00ff88' : '#ff3355',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-display)', letterSpacing: '0.5px',
                  border: `1px solid ${r.isCorrect ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,85,0.15)'}`,
                }}
                title={`${r.hand}: ${ACTION_LABELS[r.userAction]} (correct: ${ACTION_LABELS[r.correctAction]})`}
              >
                {r.hand}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
