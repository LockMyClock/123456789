import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chart, Action, TrainingResult } from '../types';
import { ACTION_COLORS, ACTION_LABELS, getCellLabel } from '../types';
import PreflopTrainerTable from './PreflopTrainerTable';
import ActionButtons from './ActionButtons';
import ChartGrid from './ChartGrid';
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
  const [dealKey, setDealKey] = useState(0);

  const dealNewHand = useCallback(() => {
    const chart = charts[Math.floor(Math.random() * charts.length)];
    setCurrentChart(chart);
    const cell = pickRandomCell(chart);
    if (!cell) return;
    setCurrentCell(cell);
    setCurrentCards(dealHandForCell(cell.row, cell.col));
    setFeedback(null);
    setShowChart(false);
    setDealKey(k => k + 1);
  }, [charts]);

  useEffect(() => { dealNewHand(); }, [dealNewHand]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!currentCell || !currentCards || feedback) return;
      const key = `${currentCell.row}-${currentCell.col}`;
      const correctAction = currentChart.cells[key];
      if (!correctAction) return;

      const actionIsPlay = action !== 'fold';
      const correctIsPlay = correctAction !== 'fold';
      const isCorrect = actionIsPlay === correctIsPlay;

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
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* HUD Stats Bar */}
      <div className="flex items-center justify-between bg-gray-900/80 backdrop-blur-sm border border-gray-700/40 rounded-xl px-5 py-3">
        <div className="flex items-center gap-6">
          <span className="font-display text-base font-black tracking-[3px] text-emerald-400">TRAINING</span>
          <div className="flex gap-5 font-display text-xs tracking-wider">
            <span className="text-gray-500">HANDS <span className="text-white font-black text-sm">{stats.total}</span></span>
            <span className="text-gray-500">CORRECT <span className="text-emerald-400 font-black text-sm">{stats.correct}</span></span>
            <span className="text-gray-500">
              ACCURACY{' '}
              <span className={`font-black text-base ${stats.pct >= 80 ? 'text-emerald-400' : stats.pct >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {stats.pct}%
              </span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {results.length > 1 && (
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors font-display tracking-wider"
            >
              {showGraph ? 'HIDE' : 'GRAPH'}
            </button>
          )}
          {!showChart && !feedback && (
            <button
              onClick={() => setShowChart(true)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-colors font-display tracking-wider"
            >
              CHART
            </button>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-display tracking-wider"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Graph */}
      <AnimatePresence>
        {showGraph && graphData.length > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-900/60 border border-gray-700/30 rounded-xl px-4 py-3 overflow-hidden"
          >
            <svg viewBox={`0 0 ${Math.max(graphData.length * 4, 200)} 100`} className="w-full h-[60px]">
              <defs>
                <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {[25, 50, 75].map(y => (
                <line key={y} x1="0" y1={y} x2={graphData.length * 4} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
              ))}
              <polyline fill="none" stroke="url(#gLine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                points={graphData.map((v, i) => `${i * 4},${100 - v}`).join(' ')}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex gap-4 items-start">
        {/* Game column */}
        <div className="flex-1 flex flex-col items-center gap-3">
          {/* Table */}
          <PreflopTrainerTable
            heroPosition={currentChart.position}
            villainPosition={currentChart.vsPosition}
            heroCards={currentCards}
            dealKey={dealKey}
            scenario={`${currentChart.scenario} • ${currentChart.name}`}
          />

          {/* Hand label */}
          {currentCell && (
            <div className="font-display text-xl font-black text-white/15 tracking-[4px]">
              {getCellLabel(currentCell.row, currentCell.col)}
            </div>
          )}

          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`text-center px-10 py-5 rounded-2xl border ${
                  feedback.correct
                    ? 'bg-emerald-500/8 border-emerald-500/20'
                    : 'bg-red-500/8 border-red-500/20'
                }`}
              >
                <div
                  className="font-display text-3xl font-black tracking-[4px]"
                  style={{
                    color: feedback.correct ? '#10b981' : '#ef4444',
                    textShadow: `0 0 30px ${feedback.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                  }}
                >
                  {feedback.correct ? 'CORRECT' : 'WRONG'}
                </div>
                {!feedback.correct && (
                  <div className="mt-3 flex flex-col items-center gap-3">
                    <div className="text-sm text-gray-400">
                      Correct:{' '}
                      <span
                        className="font-bold text-white px-3 py-1 rounded-md text-xs"
                        style={{ background: ACTION_COLORS[feedback.correctAction] }}
                      >
                        {ACTION_LABELS[feedback.correctAction]}
                      </span>
                    </div>
                    <button
                      onClick={() => dealNewHand()}
                      className="mt-1 px-8 py-2.5 rounded-xl font-display font-black tracking-wider text-sm text-black cursor-pointer transition-transform hover:-translate-y-0.5"
                      style={{
                        background: 'linear-gradient(180deg, #34d399, #10b981)',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
                      }}
                    >
                      CONTINUE →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {!feedback && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <ActionButtons
                onFold={() => handleAction('fold')}
                onCall={() => handleAction('call')}
                onRaise={() => handleAction('raise')}
                disabled={!!feedback}
              />
            </motion.div>
          )}
        </div>

        {/* Chart sidebar */}
        <div className="flex flex-col items-center gap-2 min-w-0">
          {feedback && !feedback.correct && (
            <div className="font-display text-[9px] tracking-[2px] text-gray-500 uppercase">
              Your hand on chart
            </div>
          )}
          {showChart && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <ChartGrid cells={currentChart.cells} readOnly highlightCell={highlightKey} compact />
            </motion.div>
          )}
        </div>
      </div>

      {/* Recent hands */}
      {results.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-700/20 rounded-xl px-4 py-2.5">
          <div className="flex flex-wrap gap-1">
            {results.slice(-30).reverse().map((r, i) => (
              <span
                key={i}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-display tracking-wide border
                  ${r.isCorrect
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                    : 'bg-red-500/10 text-red-400 border-red-500/15'
                  }`}
                title={`${r.hand}: ${ACTION_LABELS[r.userAction]} → ${ACTION_LABELS[r.correctAction]}`}
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
