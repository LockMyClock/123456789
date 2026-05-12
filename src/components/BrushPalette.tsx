import type { Action } from '../types';
import { ACTION_COLORS, ACTION_LABELS } from '../types';

interface BrushPaletteProps {
  currentBrush: Action;
  onBrushChange: (action: Action) => void;
}

const ACTIONS: Action[] = ['fold', 'call', 'raise', '3bet', '4bet', 'mixed'];

export default function BrushPalette({ currentBrush, onBrushChange }: BrushPaletteProps) {
  return (
    <div className="flex gap-1.5 flex-wrap items-center">
      {ACTIONS.map(action => {
        const active = currentBrush === action;
        const bg = ACTION_COLORS[action];
        return (
          <button
            key={action}
            onClick={() => onBrushChange(action)}
            className="px-4 py-2 text-xs font-black rounded-lg cursor-pointer transition-all uppercase tracking-wider font-display border-0"
            style={{
              background: active ? bg : `${bg}66`,
              color: '#fff',
              outline: active ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
              boxShadow: active ? `0 0 20px ${bg}55` : 'none',
              transform: active ? 'scale(1.05)' : undefined,
            }}
          >
            {ACTION_LABELS[action]}
          </button>
        );
      })}
      <span className="ml-2 text-[10px] text-gray-600 font-bold tracking-wider font-display">RMB = ERASE</span>
    </div>
  );
}
