export default function OpponentCards() {
  return (
    <div className="flex -space-x-3">
      <div
        className="w-8 h-11 rounded-sm border border-red-700/60"
        style={{
          background: 'linear-gradient(135deg, #8b1a1a 0%, #b91c1c 30%, #991b1b 70%, #7f1d1d 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          transform: 'rotate(-5deg)',
        }}
      >
        <div className="w-full h-full rounded-sm flex items-center justify-center"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
        />
      </div>
      <div
        className="w-8 h-11 rounded-sm border border-red-700/60"
        style={{
          background: 'linear-gradient(135deg, #8b1a1a 0%, #b91c1c 30%, #991b1b 70%, #7f1d1d 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          transform: 'rotate(5deg)',
        }}
      >
        <div className="w-full h-full rounded-sm flex items-center justify-center"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
        />
      </div>
    </div>
  );
}
