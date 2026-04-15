export type Student = "bruno" | "fabiola";

export interface AttendanceRecord {
  id: string;
  student: Student;
  date: string; // YYYY-MM-DD — "----" quando não tem data
  weekDay: string; // "--" quando não tem dia
  weekNumber: number;
  year: number;
  timestamp: number;
  hasDate: boolean; // false = registro histórico sem data
}

export interface StudentInfo {
  id: Student;
  name: string;
  belt: string;
  emoji: string;
  baseCount: number; // aulas históricas sem data
}

export const STUDENTS: StudentInfo[] = [
  { id: "bruno", name: "Bruno Jorge", belt: "Faixa Branca", emoji: "🧡", baseCount: 46 },
  { id: "fabiola", name: "Fabiola Stopa", belt: "Faixa Branca", emoji: "💜", baseCount: 19 },
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
    hasDate: true,
  };
  const records = getRecords();
  records.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return record;
}

export function getRecordsByStudent(student: Student): AttendanceRecord[] {
  return getRecords().filter((r) => r.student === student);
}

export function getDatedRecordsByStudent(student: Student): AttendanceRecord[] {
  return getRecords().filter((r) => r.student === student && r.hasDate);
}

export function getWeeklyRecords(student: Student): AttendanceRecord[] {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();
  return getRecords().filter(
    (r) =>
      r.student === student &&
      r.hasDate &&
      r.weekNumber === currentWeek &&
      r.year === currentYear
  );
}

export function getMonthlyRecords(student: Student): AttendanceRecord[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return getRecords().filter((r) => {
    if (!r.hasDate) return false;
    const rDate = new Date(r.date);
    return (
      r.student === student &&
      rDate.getMonth() === currentMonth &&
      rDate.getFullYear() === currentYear
    );
  });
}

export function getLastClass(student: Student): AttendanceRecord | null {
  return getRecords().find((r) => r.student === student && r.hasDate) ?? null;
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
  const rows = records
    .filter((r) => r.hasDate)
    .map((r) => [r.id, r.student, r.date, r.weekDay, r.weekNumber, r.year].join(","))
    .join("\n");
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

  const records: AttendanceRecord[] = [];

  for (const student of STUDENTS) {
    for (let i = 0; i < student.baseCount; i++) {
      records.push({
        id: `hist-${student.id}-${i}`,
        student: student.id,
        date: "----",
        weekDay: "--",
        weekNumber: 0,
        year: 0,
        timestamp: 0,
        hasDate: false,
      });
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getTotalCount(student: Student): number {
  const studentInfo = STUDENTS.find((s) => s.id === student);
  const base = studentInfo?.baseCount ?? 0;
  const dated = getDatedRecordsByStudent(student).length;
  return base + dated;
}