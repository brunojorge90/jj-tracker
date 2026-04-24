"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import type { AttendanceRecord, Student } from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function HistoryTable({
  records,
  filter,
  onFilterChange,
}: {
  records: AttendanceRecord[];
  filter: Student | "all";
  onFilterChange: (f: Student | "all") => void;
}) {
  const filtered = filter === "all" ? records : records.filter((r) => r.student === filter);

  return (
    <Card>
      <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[color:var(--dojo-border)]">
        <h3 className="font-display text-base tracking-[0.2em] uppercase text-white">
          Histórico
        </h3>
        <div className="flex gap-1 p-1 bg-[color:var(--dojo-bg-elev)] rounded-xl border border-[color:var(--dojo-border-hot)] shadow-[inset_0_1px_0_rgba(245,158,11,0.08)]">
          {(["all", "bruno", "fabiola"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`relative px-3 py-1.5 rounded-lg text-[10px] sm:text-xs tracking-[0.16em] uppercase font-semibold transition-colors dojo-ring-amber ${
                filter === f
                  ? "text-black"
                  : "text-[color:var(--dojo-text-muted)] hover:text-white"
              }`}
            >
              {filter === f && (
                <motion.span
                  layoutId="history-filter-pill"
                  className="absolute inset-0 bg-gradient-to-b from-[#fbbf24] to-[color:var(--dojo-amber-burn)] rounded-lg shadow-[0_4px_16px_-4px_rgba(245,158,11,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]"
                  transition={{ type: "spring", stiffness: 500, damping: 34 }}
                />
              )}
              <span className="relative z-10">
                {f === "all" ? "Todos" : f === "bruno" ? "Bruno" : "Fabíola"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="overflow-y-auto max-h-64"
        role="log"
        aria-live="polite"
        aria-label="Lista de aulas registradas"
      >
        <table className="w-full text-sm">
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-[color:var(--dojo-text-dim)] text-center py-12 text-sm tracking-[0.12em] uppercase">
                    Nenhuma aula registrada
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.015, 0.2) }}
                    className="border-b border-[color:var(--dojo-border)]/60 dojo-row-hover transition-all"
                  >
                    <td className="px-5 sm:px-7 py-3 text-[10px] tracking-[0.22em] uppercase font-black w-28">
                      <span className="text-[color:var(--dojo-amber-soft)]">
                        {r.student === "bruno" ? "BRUNO" : "FABIOLA"}
                      </span>
                    </td>
                    <td className="py-3 text-[color:var(--dojo-text-muted)] text-sm tabular-nums font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3 text-[color:var(--dojo-text-dim)] text-xs pr-5 sm:pr-7 text-right capitalize tracking-wide">
                      {r.weekDay}
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
