"use client";

function formatDisplay(dateStr: string, today: string): { main: string; tag: string } {
  if (!dateStr || dateStr === today) {
    const t = new Date(today + "T00:00:00");
    return {
      main: t.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      tag: "HOJE",
    };
  }
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(today + "T00:00:00");
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000);
  const main = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (diff === 1) return { main, tag: "ONTEM" };
  if (diff > 1 && diff <= 5) return { main, tag: `${diff}D ATRÁS` };
  return { main, tag: "" };
}

export function DateSelector({
  value,
  onChange,
  max,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  max: string;
  id: string;
}) {
  const { main, tag } = formatDisplay(value, max);

  return (
    <label
      htmlFor={id}
      className="
        relative block w-full cursor-pointer
        min-h-[56px] sm:min-h-[48px] rounded-xl
        bg-[color:var(--dojo-bg-elev)]
        border border-[color:var(--dojo-border-hot)]
        shadow-[inset_0_1px_0_rgba(245,158,11,0.1)]
        hover:border-[color:var(--dojo-amber)]/60 transition-colors
        focus-within:ring-2 focus-within:ring-[color:var(--dojo-amber)] focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--dojo-bg)]
      "
    >
      {/* Input na frente, invisível mas totalmente clicável */}
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        max={max}
        aria-label="Escolher data da aula"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [color-scheme:dark]"
      />
      {/* Camada visual — pointer-events-none garante que o input receba TODOS os taps */}
      <div className="pointer-events-none w-full h-full min-h-[56px] sm:min-h-[48px] px-4 flex items-center gap-3">
        <CalendarIcon className="w-5 h-5 text-[color:var(--dojo-amber)] shrink-0" />
        <div className="flex-1 flex items-baseline gap-2 min-w-0">
          <span className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--dojo-text-dim)] font-bold">
            data
          </span>
          <span className="text-[color:var(--dojo-amber-soft)] font-bold text-[15px] sm:text-sm tabular-nums truncate">
            {main}
          </span>
          {tag && (
            <span className="ml-auto shrink-0 text-[9px] tracking-[0.22em] uppercase font-black px-2 py-0.5 rounded-full bg-[color:var(--dojo-amber)]/15 text-[color:var(--dojo-amber-soft)] border border-[color:var(--dojo-amber)]/30">
              {tag}
            </span>
          )}
        </div>
        <ChevronIcon className="w-4 h-4 text-[color:var(--dojo-amber)]/70 shrink-0" />
      </div>
    </label>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9 L21 9" />
      <path d="M8 3 L8 7" />
      <path d="M16 3 L16 7" />
      <circle cx="8" cy="14" r="0.5" fill="currentColor" />
      <circle cx="12" cy="14" r="0.5" fill="currentColor" />
      <circle cx="16" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 9 L12 15 L18 9" />
    </svg>
  );
}
