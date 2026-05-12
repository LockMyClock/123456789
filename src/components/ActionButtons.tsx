import { useEffect } from 'react';

interface ActionButtonsProps {
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
  disabled?: boolean;
}

export default function ActionButtons({ onFold, onCall, onRaise, disabled }: ActionButtonsProps) {
  useEffect(() => {
    if (disabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') onFold();
      else if (e.key === 'c' || e.key === 'C') onCall();
      else if (e.key === 'r' || e.key === 'R') onRaise();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onFold, onCall, onRaise, disabled]);

  const base = 'relative px-8 py-3.5 rounded-xl font-black text-lg tracking-wider uppercase transition-all duration-200 border-0 cursor-pointer font-display disabled:opacity-40 disabled:cursor-default';

  return (
    <div className="flex items-center gap-4 justify-center">
      {/* Fold */}
      <button
        onClick={onFold}
        disabled={disabled}
        className={`${base} text-white`}
        style={{
          background: 'linear-gradient(180deg, #4b5563 0%, #374151 50%, #1f2937 100%)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)',
        }}
      >
        <span className="relative z-10">Fold</span>
        <span className="absolute top-1 right-2 text-[9px] text-gray-400 font-normal tracking-normal opacity-60">F</span>
      </button>

      {/* Call */}
      <button
        onClick={onCall}
        disabled={disabled}
        className={`${base} text-white`}
        style={{
          background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)',
          boxShadow: '0 4px 15px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 0 rgba(0,0,0,0.3)',
        }}
      >
        <span className="relative z-10">Call</span>
        <span className="absolute top-1 right-2 text-[9px] text-blue-300 font-normal tracking-normal opacity-60">C</span>
      </button>

      {/* Raise */}
      <button
        onClick={onRaise}
        disabled={disabled}
        className={`${base} text-black`}
        style={{
          background: 'linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)',
          boxShadow: '0 4px 15px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)',
        }}
      >
        <span className="relative z-10">Raise</span>
        <span className="absolute top-1 right-2 text-[9px] text-emerald-800 font-normal tracking-normal opacity-60">R</span>
      </button>
    </div>
  );
}
