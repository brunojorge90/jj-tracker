"use client";

import { useEffect, useState, useCallback } from "react";
import {
  STUDENTS,
  addRecord,
  getRecordsByStudent,
  getWeeklyRecords,
  getMonthlyRecords,
  getLastClass,
  getRecords,
  downloadCsv,
  seedHistoricalData,
  getTotalCount,
  type Student,
  type AttendanceRecord,
} from "@/lib/storage";

function formatDate(dateStr: string): string {
  if (dateStr === "----") return "--";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function StreakBadge({ student }: { student: Student }) {
  const [last, setLast] = useState<AttendanceRecord | null>(null);
  useEffect(() => { setLast(getLastClass(student)); }, [student]);
  if (!last) return null;
  const days = daysAgo(last.date);
  if (days === 0) return <span className="text-green-400 font-bold text-xs tracking-wide uppercase">Hoje</span>;
  if (days === 1) return <span className="text-zinc-400 text-xs tracking-wide uppercase">Ontem</span>;
  if (days <= 5) return <span className="text-orange-400 text-xs tracking-wide uppercase">{days}d sem aula</span>;
  return <span className="text-red-400 text-xs tracking-wide uppercase">{days}d sem aula</span>;
}

function StudentCard({ student }: { student: { id: Student; name: string; belt: string; emoji: string } }) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  const refresh = useCallback(() => setRecords(getRecordsByStudent(student.id)), [student.id]);
  useEffect(() => { refresh(); }, [refresh]);

  function handleAdd() {
    addRecord(student.id);
    refresh();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  const weeklyCount = getWeeklyRecords(student.id).length;
  const monthlyCount = getMonthlyRecords(student.id).length;
  const totalCount = getTotalCount(student.id);
  const lastClass = getLastClass(student.id);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-xs tracking-widest uppercase font-medium mb-0.5">{student.belt}</p>
          <h2 className="text-white font-bold text-2xl tracking-tight">{student.name}</h2>
        </div>

        <div className="text-right">
          <p className="text-4xl font-black text-yellow-500 leading-none">{totalCount}</p>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mt-0.5">aulas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-zinc-800">
        <div className="px-6 py-4 border-r border-zinc-800">
          <p className="text-2xl font-bold text-blue-400">{monthlyCount}</p>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mt-0.5">este mes</p>
        </div>
        <div className="px-6 py-4">
          <p className="text-2xl font-bold text-purple-400">{weeklyCount}</p>
          <p className="text-zinc-500 text-xs tracking-widest uppercase mt-0.5">esta semana</p>
        </div>
      </div>

      <div className="px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {lastClass ? (
            <>
              <span className="text-zinc-500 text-xs tracking-wide shrink-0">ultima:</span>
              <span className="text-zinc-300 text-sm truncate">{formatDate(lastClass.date)}</span>
              <StreakBadge student={student.id} />
            </>
          ) : (
            <span className="text-zinc-600 text-sm">sem aulas com data</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`
            ml-auto shrink-0 px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200
            bg-yellow-600 hover:bg-yellow-500 active:scale-95 text-black
            ${justAdded ? "ring-4 ring-green-400" : "shadow-lg shadow-yellow-900/20"}
          `}
        >
          {justAdded ? "OK" : "+ aula"}
        </button>
      </div>
    </div>
  );
}

function HistoryTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filter, setFilter] = useState<Student | "all">("all");
  const refresh = useCallback(() => setRecords(getRecords()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const filtered = filter === "all" ? records : records.filter((r) => r.student === filter);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h3 className="text-white font-bold text-base tracking-wide">HISTORICO</h3>
        <div className="flex gap-1">
          {(["all", "bruno", "fabiola"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs tracking-widest uppercase font-medium transition-colors ${
                filter === f
                  ? "bg-yellow-600 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Todos" : f === "bruno" ? "Bruno" : "Fabiola"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto max-h-56">
        <table className="w-full text-sm">
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-zinc-600 text-center py-10 text-sm tracking-wide">
                  Nenhuma aula registrada
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/50">
                  <td className="px-6 py-3 text-zinc-400 text-xs tracking-widest uppercase w-24">
                    {r.student === "bruno" ? "BRUNO" : "FABIOLA"}
                  </td>
                  <td className="py-3 text-zinc-200 text-sm">{formatDate(r.date)}</td>
                  <td className="py-3 text-zinc-500 text-sm pr-6 text-right capitalize">{r.weekDay}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    seedHistoricalData();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="px-4 pt-8 pb-6 flex flex-col items-center text-center">
        <img src="/team-logo.jpg" alt="Logo equipe" className="w-20 h-20 rounded-xl object-cover" />
        <h1 className="text-2xl font-black text-white tracking-tighter">
          Jiu Jitsu <span className="text-yellow-500">Tracker</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1 tracking-wide">Bruno & Fabiola</p>
      </header>

      <section className="flex-1 px-4 pb-8 max-w-xl mx-auto w-full flex flex-col gap-3">
        {STUDENTS.map((s) => (
          <StudentCard key={s.id} student={s} />
        ))}

        <HistoryTable />

        <button
          onClick={downloadCsv}
          className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm tracking-widest uppercase font-medium transition-colors border border-zinc-800 mt-2"
        >
          Exportar CSV
        </button>
      </section>
    </main>
  );
}