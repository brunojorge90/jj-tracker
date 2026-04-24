"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { BeltStripe } from "./BeltStripe";
import { CountUp } from "./CountUp";
import { StreakBadge } from "./StreakBadge";
import {
  getLastClass,
  getMonthlyRecords,
  getTotalCount,
  getWeeklyRecords,
  type AttendanceRecord,
  type Student,
} from "@/lib/types";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function StudentCard({
  student,
  records,
  onAdd,
}: {
  student: { id: Student; name: string; belt: string; emoji: string };
  records: AttendanceRecord[];
  onAdd: (student: Student, date: string) => Promise<void>;
}) {
  const [haloKey, setHaloKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date().toISOString().split("T")[0];

  async function handleAdd() {
    if (saving) return;
    setSaving(true);
    const dateToSave = selectedDate || today;
    try {
      await onAdd(student.id, dateToSave);
      setSelectedDate("");
      setHaloKey((k) => k + 1);
    } finally {
      setSaving(false);
    }
  }

  const weeklyCount = getWeeklyRecords(records, student.id).length;
  const monthlyCount = getMonthlyRecords(records, student.id).length;
  const totalCount = getTotalCount(records, student.id);
  const lastClass = getLastClass(records, student.id);

  return (
    <Card className="relative">
      {/* Kanji watermark 柔 (ju — suavidade) */}
      <span
        aria-hidden="true"
        className="font-kanji absolute top-2 right-3 text-[180px] leading-none text-[color:var(--dojo-amber)] opacity-[0.07] pointer-events-none select-none"
      >
        柔
      </span>

      <div className="relative px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-[color:var(--dojo-text-dim)] text-[10px] tracking-[0.18em] uppercase font-semibold mb-1 flex items-center gap-1.5">
              <KimonoIcon className="w-3 h-3" />
              {student.belt}
            </p>
            <h2 className="font-display text-[32px] sm:text-4xl text-white leading-none uppercase">
              {student.name}
            </h2>
            <div className="mt-3 max-w-[140px]">
              <BeltStripe />
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-display text-[56px] sm:text-6xl leading-none text-[color:var(--dojo-amber)] dojo-ember">
              <CountUp value={totalCount} />
            </p>
            <p className="text-[color:var(--dojo-amber-soft)]/80 text-[10px] tracking-[0.2em] uppercase mt-1 font-semibold">
              aulas
            </p>
          </div>
        </div>
      </div>

      <div className="dojo-strip" />

      <div className="grid grid-cols-2 relative">
        <div className="px-5 py-4 border-r border-[color:var(--dojo-border)] bg-gradient-to-br from-amber-500/[0.04] to-transparent">
          <p className="font-display text-[28px] sm:text-3xl text-[color:var(--dojo-amber-soft)] leading-none">
            <CountUp value={monthlyCount} />
          </p>
          <p className="text-[color:var(--dojo-text-muted)] text-[10px] tracking-[0.18em] uppercase mt-1.5 font-semibold">
            este mês
          </p>
        </div>
        <div className="px-5 py-4 bg-gradient-to-bl from-amber-500/[0.04] to-transparent">
          <p className="font-display text-[28px] sm:text-3xl text-[color:var(--dojo-amber-soft)] leading-none">
            <CountUp value={weeklyCount} />
          </p>
          <p className="text-[color:var(--dojo-text-muted)] text-[10px] tracking-[0.18em] uppercase mt-1.5 font-semibold">
            esta semana
          </p>
        </div>
      </div>

      <div className="dojo-strip" />

      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Última aula + streak */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-h-[24px]">
          {lastClass ? (
            <>
              <span className="text-[color:var(--dojo-text-dim)] text-[10px] tracking-[0.18em] uppercase font-semibold shrink-0">
                última
              </span>
              <span className="text-[color:var(--dojo-text-muted)] text-sm tabular-nums font-medium">
                {formatDate(lastClass.date)}
              </span>
              <StreakBadge last={lastClass} />
            </>
          ) : (
            <span className="text-[color:var(--dojo-text-dim)] text-sm italic">sem registros</span>
          )}
        </div>

        {/* Controles — mobile-first: stack; desktop: inline */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            aria-label="Data da aula (opcional — padrão: hoje)"
            className="bg-[color:var(--dojo-bg-elev)] border border-[color:var(--dojo-border-hot)] text-[color:var(--dojo-amber-soft)] text-base sm:text-sm rounded-xl px-3 py-3 sm:py-2.5 dojo-ring-amber tabular-nums w-full sm:w-[140px] min-h-[48px] sm:min-h-0 [color-scheme:dark]"
          />
          <motion.button
            key={haloKey}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={handleAdd}
            disabled={saving}
            aria-label={`Adicionar aula de ${student.name}`}
            className={`
              relative flex-1 sm:flex-none min-h-[52px] sm:min-h-0 px-6 py-3 rounded-xl
              font-black text-base sm:text-sm tracking-[0.2em] uppercase
              bg-gradient-to-b from-[#fbbf24] to-[color:var(--dojo-amber-burn)]
              text-black dojo-ring-amber
              shadow-[0_10px_28px_-8px_rgba(245,158,11,0.75),inset_0_1px_0_rgba(255,255,255,0.3)]
              hover:shadow-[0_14px_36px_-8px_rgba(245,158,11,0.95),inset_0_1px_0_rgba(255,255,255,0.35)]
              disabled:opacity-60 disabled:cursor-wait
              flex items-center justify-center gap-2
              ${haloKey > 0 ? "dojo-halo" : ""}
            `}
          >
            {saving ? (
              <span className="tracking-widest">…</span>
            ) : (
              <>
                <FistIcon className="w-4 h-4" />
                <span>+ aula</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </Card>
  );
}

function KimonoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 4 L12 10 L19 4" />
      <path d="M5 4 L5 20 L12 17 L19 20 L19 4" />
      <path d="M12 10 L12 17" />
    </svg>
  );
}

function FistIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 10 L6 16 a2 2 0 0 0 2 2 h9 a2 2 0 0 0 2 -2 v-3" />
      <path d="M9 10 L9 6 a1.5 1.5 0 0 1 3 0 v4" />
      <path d="M12 10 L12 5 a1.5 1.5 0 0 1 3 0 v5" />
      <path d="M15 10 L15 6 a1.5 1.5 0 0 1 3 0 v6" />
      <path d="M6 11 a2 2 0 0 0 -2 2 v1 a2 2 0 0 0 2 2" />
    </svg>
  );
}
