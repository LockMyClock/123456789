import type { Action } from '../types';
import { ACTION_COLORS, ACTION_LABELS } from '../types';

interface BrushPaletteProps {
  currentBrush: Action;
  onBrushChange: (action: Action) => void;
}

const ACTIONS: Action[] = ['fold', 'call', 'raise', '3bet', '4bet', 'mixed'];

export default function BrushPalette({ currentBrush, onBrushChange }: BrushPaletteProps) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {ACTIONS.map(action => {
        const isActive = currentBrush === action;
        const bg = ACTION_COLORS[action];
        return (
          <button
            key={action}
            onClick={() => onBrushChange(action)}
            style={{
              background: isActive ? bg : `${bg}66`,
              color: '#fff',
              border: isActive ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isActive ? `0 0 20px ${bg}55` : 'none',
              transform: isActive ? 'scale(1.05)' : undefined,
              transition: 'all 0.15s',
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {ACTION_LABELS[action]}
          </button>
        );
      })}
      <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
        RMB = ERASE
      </span>
    </div>
  );
}
