import type { AttendanceRecord } from "@/lib/types";

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  return Math.round((today.getTime() - thenDay.getTime()) / 86400000);
}

export function StreakBadge({ last }: { last: AttendanceRecord | null }) {
  if (!last) return null;
  const days = daysAgo(last.date);

  const base =
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.12em] uppercase border";

  if (days === 0) {
    return (
      <span className={`${base} bg-amber-500/15 text-amber-300 border-amber-500/30`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dojo-pulse" />
        Hoje
      </span>
    );
  }
  if (days === 1) {
    return <span className={`${base} bg-stone-500/10 text-stone-300 border-stone-500/20`}>Ontem</span>;
  }
  if (days <= 5) {
    return (
      <span className={`${base} bg-orange-500/10 text-orange-300 border-orange-500/25`}>
        {days}d sem aula
      </span>
    );
  }
  return (
    <span className={`${base} bg-red-500/10 text-red-300 border-red-500/25`}>
      {days}d sem aula
    </span>
  );
}
