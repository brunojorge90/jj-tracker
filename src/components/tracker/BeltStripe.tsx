export function BeltStripe({ stripes = 0 }: { stripes?: number }) {
  return (
    <div
      className="relative h-2 rounded-full overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.6)]"
      style={{ background: "linear-gradient(180deg, #fef7ed, #e7dcc7)" }}
      aria-label="Faixa branca"
      role="img"
    >
      <div
        className="absolute top-0 right-0 h-full w-[22%] bg-black"
        style={{ boxShadow: "inset 1px 0 0 rgba(245,158,11,0.3)" }}
      />
      {Array.from({ length: Math.min(stripes, 4) }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full w-[2px] bg-white"
          style={{ right: `${2 + i * 4}%`, boxShadow: "0 0 2px rgba(0,0,0,0.3)" }}
        />
      ))}
    </div>
  );
}
