import type { Position } from '../types';

interface PositionLabelProps {
  position: Position;
  isHero: boolean;
  isActive?: boolean;
  nickname?: string;
  stackBB?: number;
}

export default function PositionLabel({ position, isHero, isActive, nickname, stackBB = 100 }: PositionLabelProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Nickname / Position tag */}
      <div
        className={`
          relative px-3 py-1 rounded-lg text-center min-w-[70px]
          transition-all duration-300
          ${isHero
            ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white border border-emerald-400/50'
            : 'bg-gray-800/90 text-gray-300 border border-gray-600/40'
          }
          ${isActive ? 'glow-pulse' : ''}
        `}
        style={{
          boxShadow: isHero
            ? '0 0 20px rgba(16,185,129,0.4), 0 4px 12px rgba(0,0,0,0.5)'
            : '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        {/* Position badge */}
        {isHero && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-400 text-black text-[8px] font-black px-1.5 py-0 rounded-full tracking-wider">
            {position}
          </div>
        )}
        <div className={`text-xs font-bold ${isHero ? 'mt-1' : ''}`}>
          {isHero ? (nickname || 'Hero') : position}
        </div>
      </div>
      {/* Stack */}
      <div
        className={`
          text-[10px] font-bold px-2 py-0.5 rounded
          ${isHero
            ? 'bg-emerald-900/60 text-emerald-300'
            : 'bg-gray-900/60 text-gray-400'
          }
        `}
      >
        {stackBB} BB
      </div>
    </div>
  );
}
