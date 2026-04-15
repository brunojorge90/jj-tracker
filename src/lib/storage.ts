export type Student = "bruno" | "fabiola";

export interface AttendanceRecord {
  id: string;
  student: Student;
  date: string; // YYYY-MM-DD
  weekDay: string;
  weekNumber: number;
  year: number;
  timestamp: number;
}

export interface StudentInfo {
  id: Student;
  name: string;
  belt: string;
  emoji: string;
}

export const STUDENTS: StudentInfo[] = [
  { id: "bruno", name: "Bruno Jorge", belt: "Faixa Branca", emoji: "🧡" },
  { id: "fabiola", name: "Fabiola Stopa", belt: "Faixa Branca", emoji: "💜" },
];

const STORAGE_KEY = "jj_attendance";

export function getRecords(): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecord(student: Student): AttendanceRecord {
  const now = new Date();
  const record: AttendanceRecord = {
    id: `${student}-${now.getTime()}`,
    student,
    date: now.toISOString().split("T")[0],
    weekDay: now.toLocaleDateString("pt-BR", { weekday: "long" }),
    weekNumber: getWeekNumber(now),
    year: now.getFullYear(),
    timestamp: now.getTime(),
  };
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function getRecordsByStudent(student: Student): AttendanceRecord[] {
  return getRecords().filter((r) => r.student === student);
}

export function getWeeklyRecords(student: Student): AttendanceRecord[] {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  return getRecords().filter(
    (r) =>
      r.student === student &&
      r.weekNumber === currentWeek &&
      r.year === currentYear
  );
}

export function getMonthlyRecords(student: Student): AttendanceRecord[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return getRecords().filter((r) => {
    const rDate = new Date(r.date);
    return (
      r.student === student &&
      rDate.getMonth() === currentMonth &&
      rDate.getFullYear() === currentYear
    );
  });
}

export function getLastClass(student: Student): AttendanceRecord | null {
  return getRecords().find((r) => r.student === student) ?? null;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function exportToCsv(): string {
  const records = getRecords();
  const header = "ID,Aluno,Data,Dia da Semana,Semana,Ano\n";
  const rows = records.map((r) =>
    [r.id, r.student, r.date, r.weekDay, r.weekNumber, r.year].join(",")
  ).join("\n");
  return header + rows;
}

export function downloadCsv() {
  const csv = exportToCsv();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jj-presencas-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function seedHistoricalData() {
  if (typeof window === "undefined") return;
  const existing = getRecords();
  if (existing.length > 0) return;

  const brunoCount = 46;
  const fabiolaCount = 19;

  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 4);
  start.setDate(1);

  const brunoDates = generateDates(brunoCount, start, now, 3, 2);
  const fabiolaDates = generateDates(fabiolaCount, start, now, 2, 1);

  const records: AttendanceRecord[] = [
    ...brunoDates.map((d) => makeRecord("bruno", d)),
    ...fabiolaDates.map((d) => makeRecord("fabiola", d)),
  ];

  records.sort((a, b) => a.timestamp - b.timestamp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function makeRecord(student: Student, date: Date): AttendanceRecord {
  return {
    id: `${student}-${date.getTime()}`,
    student,
    date: date.toISOString().split("T")[0],
    weekDay: date.toLocaleDateString("pt-BR", { weekday: "long" }),
    weekNumber: getWeekNumber(date),
    year: date.getFullYear(),
    timestamp: date.getTime(),
  };
}

function generateDates(
  count: number,
  start: Date,
  end: Date,
  maxPerWeek: number,
  minPerWeek: number
): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (dates.length < count && current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    const weekStart = new Date(current);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const classesThisWeek = dates.filter((d) => d >= weekStart && d <= weekEnd).length;

    if (classesThisWeek < maxPerWeek && Math.random() > 0.2) {
      dates.push(new Date(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}