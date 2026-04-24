export type Student = "bruno" | "fabiola";

export interface AttendanceRecord {
  id: number;
  student: Student;
  date: string;
  weekDay: string;
}

export const BASE_COUNT: Record<Student, number> = { bruno: 46, fabiola: 19 };

export const STUDENTS: { id: Student; name: string; belt: string; emoji: string }[] = [
  { id: "bruno", name: "Bruno", belt: "Faixa Branca", emoji: "🥋" },
  { id: "fabiola", name: "Fabiola", belt: "Faixa Branca", emoji: "🥋" },
];

const WEEK_DAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export function getWeekDay(dateStr: string): string {
  return WEEK_DAYS[new Date(dateStr + "T00:00:00").getDay()];
}

export function getRecordsByStudent(records: AttendanceRecord[], student: Student): AttendanceRecord[] {
  return records.filter((r) => r.student === student);
}

export function getWeeklyRecords(records: AttendanceRecord[], student: Student): AttendanceRecord[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return getRecordsByStudent(records, student).filter(
    (r) => new Date(r.date + "T00:00:00") >= weekStart,
  );
}

export function getMonthlyRecords(records: AttendanceRecord[], student: Student): AttendanceRecord[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return getRecordsByStudent(records, student).filter(
    (r) => new Date(r.date + "T00:00:00") >= monthStart,
  );
}

export function getLastClass(records: AttendanceRecord[], student: Student): AttendanceRecord | null {
  const list = getRecordsByStudent(records, student);
  return list.length > 0 ? list[0] : null;
}

export function getTotalCount(records: AttendanceRecord[], student: Student): number {
  return BASE_COUNT[student] + getRecordsByStudent(records, student).length;
}
