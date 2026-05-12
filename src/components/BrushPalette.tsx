import type { Action } from '../types';
import { ACTION_COLORS, ACTION_LABELS } from '../types';

interface BrushPaletteProps {
  currentBrush: Action;
  onBrushChange: (action: Action) => void;
}

const ACTIONS: Action[] = ['fold', 'call', 'raise', '3bet', '4bet', 'mixed'];

export default function BrushPalette({ currentBrush, onBrushChange }: BrushPaletteProps) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ACTIONS.map(action => {
        const isActive = currentBrush === action;
        const bg = action === 'mixed' ? ACTION_COLORS.mixed : ACTION_COLORS[action];
        return (
          <button
            key={action}
            onClick={() => onBrushChange(action)}
            style={{
              background: bg,
              color: '#fff',
              border: isActive ? '3px solid #fff' : '3px solid transparent',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isActive ? '0 0 15px rgba(255,255,255,0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
              transform: isActive ? 'scale(1.05)' : undefined,
              transition: 'all 0.15s',
              letterSpacing: '0.3px',
            }}
          >
            {ACTION_LABELS[action]}
          </button>
        );
      })}
      <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
        ПКМ = стереть
      </div>
    </div>
  );
}
