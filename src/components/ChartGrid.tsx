import { useState, useCallback, useRef } from 'react';
import type { Action } from '../types';
import { ACTION_COLORS, RANKS, getCellLabel } from '../types';

interface ChartGridProps {
  cells: Record<string, Action>;
  onCellChange?: (key: string, action: Action | null) => void;
  readOnly?: boolean;
  currentBrush?: Action;
  highlightCell?: string;
  compact?: boolean;
  overlayCells?: Record<string, Action>;
}

export default function ChartGrid({
  cells,
  onCellChange,
  readOnly = false,
  currentBrush = 'raise',
  highlightCell,
  compact = false,
  overlayCells,
}: ChartGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragButton, setDragButton] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const cellSize = compact ? 28 : 40;
  const fontSize = compact ? 9 : 11;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      if (readOnly || !onCellChange) return;
      e.preventDefault();
      setIsDragging(true);
      setDragButton(e.button);
      if (e.button === 2) {
        onCellChange(key, null);
      } else {
        onCellChange(key, currentBrush);
      }
    },
    [readOnly, onCellChange, currentBrush]
  );

  const handleMouseEnter = useCallback(
    (key: string) => {
      if (!isDragging || readOnly || !onCellChange) return;
      if (dragButton === 2) {
        onCellChange(key, null);
      } else {
        onCellChange(key, currentBrush);
      }
    },
    [isDragging, dragButton, readOnly, onCellChange, currentBrush]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      ref={gridRef}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(13, ${cellSize}px)`,
        gap: 1,
        background: 'rgba(0,0,0,0.3)',
        padding: 1,
        borderRadius: 8,
        userSelect: 'none',
        width: 'fit-content',
      }}
    >
      {RANKS.map((_, row) =>
        RANKS.map((__, col) => {
          const key = `${row}-${col}`;
          const action = cells[key];
          const overlayAction = overlayCells ? overlayCells[key] : undefined;
          const label = getCellLabel(row, col);
          const isHighlight = highlightCell === key;

          let bg: string;
          if (overlayCells) {
            if (action) {
              bg = action === 'mixed' ? ACTION_COLORS.mixed : ACTION_COLORS[action];
            } else if (overlayAction) {
              bg = `${overlayAction === 'mixed' ? '#f59e0b' : ACTION_COLORS[overlayAction]}33`;
            } else {
              bg = '#1a1a2e';
            }
          } else {
            bg = action ? (action === 'mixed' ? ACTION_COLORS.mixed : ACTION_COLORS[action]) : '#1a1a2e';
          }

          return (
            <div
              key={key}
              onMouseDown={(e) => handleMouseDown(e, key)}
              onMouseEnter={() => handleMouseEnter(key)}
              style={{
                width: cellSize,
                height: cellSize,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: readOnly ? 'default' : 'pointer',
                fontSize,
                fontWeight: 600,
                color: action && action !== 'fold' ? '#fff' : 'rgba(255,255,255,0.4)',
                borderRadius: 3,
                transition: 'transform 0.1s, box-shadow 0.1s',
                transform: isHighlight ? 'scale(1.15)' : undefined,
                boxShadow: isHighlight
                  ? '0 0 12px 3px rgba(255,255,255,0.7)'
                  : undefined,
                zIndex: isHighlight ? 10 : undefined,
                position: 'relative',
                textShadow: action && action !== 'fold' ? '0 1px 2px rgba(0,0,0,0.5)' : undefined,
              }}
            >
              {label}
            </div>
          );
        })
      )}
    </div>
  );
}
