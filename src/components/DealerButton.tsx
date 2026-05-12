interface DealerButtonProps {
  x: number;
  y: number;
}

export default function DealerButton({ x, y }: DealerButtonProps) {
  return (
    <div
      className="absolute z-30 flex items-center justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 flex items-center justify-center text-black font-black text-xs shadow-lg border-2 border-yellow-200"
        style={{ boxShadow: '0 0 12px rgba(255,200,0,0.5), 0 2px 6px rgba(0,0,0,0.5)' }}
      >
        D
      </div>
    </div>
  );
}
