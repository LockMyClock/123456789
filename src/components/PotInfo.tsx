interface PotInfoProps {
  potBB?: number;
  heroPosition: string;
  scenario: string;
}

export default function PotInfo({ potBB = 1.5, heroPosition, scenario }: PotInfoProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Pot */}
      <div
        className="bg-black/60 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold border border-white/10"
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
      >
        <span className="text-gray-400">Pot: </span>
        <span className="text-white">{potBB} BB</span>
      </div>
      {/* Info */}
      <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase font-display">
        {scenario}
      </div>
      <div className="text-[10px] text-emerald-400/60 font-bold tracking-wider uppercase font-display">
        Hero · {heroPosition}
      </div>
    </div>
  );
}
