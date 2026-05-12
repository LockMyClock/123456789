interface BlindChipProps {
  type: 'sb' | 'bb';
  x: number;
  y: number;
}

export default function BlindChip({ type, x, y }: BlindChipProps) {
  const isBB = type === 'bb';
  return (
    <div
      className="absolute z-20 flex items-center justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`
          rounded-full flex items-center justify-center
          text-[9px] font-bold tracking-wide
          ${isBB ? 'w-12 h-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white' : 'w-12 h-5 bg-gradient-to-r from-gray-500 to-gray-400 text-white'}
        `}
        style={{
          boxShadow: isBB
            ? '0 2px 8px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        {isBB ? '1 BB' : '0.5 BB'}
      </div>
    </div>
  );
}
