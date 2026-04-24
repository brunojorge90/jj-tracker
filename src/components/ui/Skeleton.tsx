export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[color:var(--dojo-surface)] ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(245,158,11,0.06), transparent)",
          animation: "dojo-shimmer 1.6s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes dojo-shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
