"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { HistoryTable } from "@/components/tracker/HistoryTable";
import { StudentCard } from "@/components/tracker/StudentCard";
import { STUDENTS, type AttendanceRecord, type Student } from "@/lib/types";

function downloadCsv(records: AttendanceRecord[]): void {
  const rows = [["Aluno", "Data", "Dia da Semana"]];
  records.forEach((r) => rows.push([r.student, r.date, r.weekDay]));
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type SyncState = "idle" | "syncing" | "error";

export default function HomePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Student | "all">("all");
  const [sync, setSync] = useState<SyncState>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const inFlight = useRef(false);

  const loadRecords = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSync("syncing");
    try {
      const res = await fetch("/api/records", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { records: AttendanceRecord[] };
      setRecords(data.records);
      setSync("idle");
    } catch {
      setSync("error");
    } finally {
      inFlight.current = false;
    }
  }, []);

  const addRecord = useCallback(async (student: Student, date: string) => {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student, date }),
    });
    if (!res.ok) {
      setToast("Erro ao salvar. Tente de novo.");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    const data = (await res.json()) as { records: AttendanceRecord[] };
    setRecords(data.records);
    setToast("押忍 aula registrada");
    setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    loadRecords().finally(() => setLoading(false));
  }, [loadRecords]);

  useEffect(() => {
    const onFocus = () => loadRecords();
    const onVisible = () => {
      if (document.visibilityState === "visible") loadRecords();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const interval = setInterval(loadRecords, 10000);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(interval);
    };
  }, [loadRecords]);

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="relative px-4 pt-8 sm:pt-14 pb-6 sm:pb-8 flex flex-col items-center text-center">
        {/* Kanji 柔術 (jiu-jutsu) gigante atrás do header */}
        <span
          aria-hidden="true"
          className="font-kanji absolute top-2 left-1/2 -translate-x-1/2 text-[160px] sm:text-[240px] leading-none text-[color:var(--dojo-amber)] opacity-[0.05] pointer-events-none select-none whitespace-nowrap"
        >
          柔術
        </span>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-2xl bg-[color:var(--dojo-amber)] blur-2xl opacity-40 scale-110" aria-hidden="true" />
          <img
            src="/team-logo.jpg"
            alt="Logo da equipe"
            className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-[color:var(--dojo-amber)]/40 shadow-[0_20px_60px_-20px_rgba(245,158,11,0.8)]"
          />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative font-display text-[28px] sm:text-5xl mt-3 sm:mt-4 text-white uppercase tracking-[0.04em]"
        >
          Jiu Jitsu <span className="text-[color:var(--dojo-amber)]">Tracker</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="relative text-[color:var(--dojo-text-dim)] text-[10px] sm:text-sm mt-1.5 sm:mt-2 tracking-[0.28em] uppercase flex items-center gap-2"
        >
          <span className="w-5 h-px bg-[color:var(--dojo-amber)]/40" />
          Bruno · Fabíola
          <span className="w-5 h-px bg-[color:var(--dojo-amber)]/40" />
        </motion.p>

        <div className="mt-3 flex items-center gap-2 h-5">
          <AnimatePresence>
            {sync === "syncing" && (
              <motion.span
                key="syncing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] tracking-[0.22em] uppercase text-[color:var(--dojo-text-dim)] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dojo-pulse" />
                sincronizando
              </motion.span>
            )}
            {sync === "error" && (
              <motion.span
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] tracking-[0.22em] uppercase text-red-400"
              >
                ● sem conexão — tentando de novo
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </header>

      <section className="flex-1 px-4 pb-10 w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4"
          >
            {STUDENTS.map((s) => (
              <motion.div
                key={s.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <StudentCard student={s} records={records} onAdd={addRecord} />
              </motion.div>
            ))}

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
              }}
              className="md:col-span-2"
            >
              <HistoryTable records={records} filter={filter} onFilterChange={setFilter} />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { duration: 0.4 } },
              }}
              className="md:col-span-2 flex justify-center"
            >
              <button
                onClick={() => downloadCsv(records)}
                className="px-8 py-3 rounded-xl bg-[color:var(--dojo-surface)]/60 hover:bg-[color:var(--dojo-surface-hi)] text-[color:var(--dojo-amber-soft)] hover:text-white text-xs tracking-[0.22em] uppercase font-bold transition-colors border border-[color:var(--dojo-border-hot)] dojo-ring-amber shadow-[inset_0_1px_0_rgba(245,158,11,0.08)]"
              >
                Exportar CSV
              </button>
            </motion.div>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[color:var(--dojo-surface)] border border-[color:var(--dojo-amber)]/40 text-white text-sm tracking-wide shadow-[0_20px_60px_-20px_rgba(245,158,11,0.6)] flex items-center gap-2"
          >
            {toast.startsWith("押忍") ? (
              <>
                <span className="font-kanji text-[color:var(--dojo-amber)] text-lg leading-none">押忍</span>
                <span className="text-[color:var(--dojo-amber)]/40">·</span>
                <span>{toast.replace("押忍 ", "")}</span>
              </>
            ) : (
              toast
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
