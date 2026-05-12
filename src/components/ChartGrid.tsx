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
}

export default function ChartGrid({
  cells,
  onCellChange,
  readOnly = false,
  currentBrush = 'raise',
  highlightCell,
  compact = false,
}: ChartGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragButton, setDragButton] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const cellSize = compact ? 24 : 38;
  const fontSize = compact ? 8 : 11;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      if (readOnly || !onCellChange) return;
      e.preventDefault();
      setIsDragging(true);
      setDragButton(e.button);
      if (e.button === 2) onCellChange(key, null);
      else onCellChange(key, currentBrush);
    },
    [readOnly, onCellChange, currentBrush]
  );

  const handleMouseEnter = useCallback(
    (key: string) => {
      if (!isDragging || readOnly || !onCellChange) return;
      if (dragButton === 2) onCellChange(key, null);
      else onCellChange(key, currentBrush);
    },
    [isDragging, dragButton, readOnly, onCellChange, currentBrush]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

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
        background: 'rgba(0,0,0,0.5)',
        padding: 2,
        borderRadius: 8,
        userSelect: 'none',
        width: 'fit-content',
        border: '1px solid rgba(0,255,136,0.06)',
      }}
    >
      {RANKS.map((_, row) =>
        RANKS.map((__, col) => {
          const key = `${row}-${col}`;
          const action = cells[key];
          const label = getCellLabel(row, col);
          const isHighlight = highlightCell === key;
          const bg = action ? ACTION_COLORS[action] : '#080818';

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
                fontWeight: 700,
                color: action && action !== 'fold' ? '#fff' : 'rgba(255,255,255,0.2)',
                borderRadius: 2,
                transition: 'transform 0.1s, box-shadow 0.15s',
                transform: isHighlight ? 'scale(1.25)' : undefined,
                boxShadow: isHighlight
                  ? '0 0 20px 5px rgba(0,170,255,0.8), 0 0 4px rgba(255,255,255,0.7)'
                  : undefined,
                zIndex: isHighlight ? 10 : undefined,
                position: 'relative',
                textShadow: action && action !== 'fold' ? '0 1px 2px rgba(0,0,0,0.6)' : undefined,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.5px',
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
