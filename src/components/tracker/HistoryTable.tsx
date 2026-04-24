"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  onDelete,
}: {
  records: AttendanceRecord[];
  filter: Student | "all";
  onFilterChange: (f: Student | "all") => void;
  onDelete: (id: number | string) => Promise<void>;
}) {
  const filtered = filter === "all" ? records : records.filter((r) => r.student === filter);
  const [editMode, setEditMode] = useState(false);
  const [pending, setPending] = useState<AttendanceRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!pending) {
      setArmed(false);
      return;
    }
    const t = setTimeout(() => setArmed(true), 350);
    return () => clearTimeout(t);
  }, [pending]);

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    try {
      await onDelete(pending.id);
      setPending(null);
    } finally {
      setDeleting(false);
    }
  }

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
                  <td colSpan={4} className="text-[color:var(--dojo-text-dim)] text-center py-12 text-sm tracking-[0.12em] uppercase">
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
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: Math.min(i * 0.015, 0.2) }}
                    className="border-b border-[color:var(--dojo-border)]/60 dojo-row-hover transition-all"
                  >
                    <td className="px-5 sm:px-7 py-3 text-[10px] tracking-[0.22em] uppercase font-black w-24 sm:w-28">
                      <span className="text-[color:var(--dojo-amber-soft)]">
                        {r.student === "bruno" ? "BRUNO" : "FABIOLA"}
                      </span>
                    </td>
                    <td className="py-3 text-[color:var(--dojo-text-muted)] text-sm tabular-nums font-medium">
                      {formatDate(r.date)}
                    </td>
                    <td className="py-3 text-[color:var(--dojo-text-dim)] text-xs text-right capitalize tracking-wide pr-3">
                      {r.weekDay}
                    </td>
                    <td className="pr-4 sm:pr-6 py-1 w-12 text-right">
                      <AnimatePresence>
                        {editMode && (
                          <motion.button
                            key="trash"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            onClick={() => setPending(r)}
                            aria-label={`Apagar aula de ${r.student} em ${formatDate(r.date)}`}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 active:scale-90 transition-all dojo-ring-amber"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-5 sm:px-7 py-3 border-t border-[color:var(--dojo-border)] flex justify-end">
          <button
            onClick={() => setEditMode((m) => !m)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] tracking-[0.22em] uppercase font-bold transition-all dojo-ring-amber ${
              editMode
                ? "bg-[color:var(--dojo-amber)] text-black shadow-[0_4px_16px_-4px_rgba(245,158,11,0.6)]"
                : "bg-[color:var(--dojo-bg-elev)] border border-[color:var(--dojo-border-hot)] text-[color:var(--dojo-amber-soft)] hover:border-[color:var(--dojo-amber)]/60"
            }`}
          >
            {editMode ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                Pronto
              </>
            ) : (
              <>
                <PencilIcon className="w-3.5 h-3.5" />
                Editar
              </>
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {pending && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
            onClick={() => armed && !deleting && setPending(null)}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="w-full max-w-sm mb-4 sm:mb-0 dojo-card rounded-2xl overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
                  <TrashIcon className="w-6 h-6 text-red-400" />
                </div>
                <h4 id="delete-title" className="font-display text-xl uppercase tracking-wider text-white mb-2">
                  Apagar aula?
                </h4>
                <p className="text-[color:var(--dojo-text-muted)] text-sm leading-relaxed">
                  <span className="text-[color:var(--dojo-amber-soft)] font-bold">
                    {pending.student === "bruno" ? "Bruno" : "Fabíola"}
                  </span>{" "}
                  —{" "}
                  <span className="tabular-nums font-semibold text-white">
                    {formatDate(pending.date)}
                  </span>
                  <br />
                  <span className="text-xs text-[color:var(--dojo-text-dim)] tracking-wide">
                    Esta ação não pode ser desfeita.
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-0 border-t border-[color:var(--dojo-border)]">
                <button
                  onClick={() => setPending(null)}
                  disabled={deleting}
                  className="min-h-[52px] font-bold text-sm tracking-[0.2em] uppercase text-[color:var(--dojo-text-muted)] hover:text-white hover:bg-[color:var(--dojo-surface-hi)] transition-colors border-r border-[color:var(--dojo-border)] disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="min-h-[52px] font-black text-sm tracking-[0.2em] uppercase text-red-300 hover:text-white hover:bg-red-500/20 transition-colors disabled:opacity-60"
                >
                  {deleting ? "…" : "Apagar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20 L4 20 L4 16 L16 4 L20 8 L8 20" />
      <path d="M14 6 L18 10" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12 L10 17 L19 7" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 7 L20 7" />
      <path d="M10 11 L10 17" />
      <path d="M14 11 L14 17" />
      <path d="M5 7 L6 20 a1 1 0 0 0 1 1 h10 a1 1 0 0 0 1 -1 L19 7" />
      <path d="M9 7 L9 4 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 L15 7" />
    </svg>
  );
}
