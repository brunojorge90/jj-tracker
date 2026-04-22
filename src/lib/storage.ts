import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://driven-viper-104620.upstash.io",
  token: "gQAAAAAAAZisAAIgcDE4MzZlYTQ1YzhlOWY0NTZjOGFlZmU3YTJhYzVlMDBkMQ",
});

export type Student = "bruno" | "fabiola";

export interface AttendanceRecord {
  id: string;
  student: Student;
  date: string;
  weekDay: string;
}

interface StorageData {
  records: AttendanceRecord[];
}

const STORAGE_KEY = "jj_attendance";
const BASE_COUNT: Record<Student, number> = { bruno: 46, fabiola: 19 };

export const STUDENTS: { id: Student; name: string; belt: string; emoji: string }[] = [
  { id: "bruno", name: "Bruno", belt: "Faixa Preta", emoji: "🖤" },
  { id: "fabiola", name: "Fabiola", belt: "Faixa Roxa", emoji: "💜" },
];

function getWeekDay(dateStr: string): string {
  const days = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return days[new Date(dateStr + "T00:00:00").getDay()];
}

export async function fetchFromRedis(): Promise<StorageData> {
  try {
    const data = await redis.get<string>(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data as string) as StorageData;
      // Cache in localStorage for helper functions
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error("Redis read error:", e);
  }
  return { records: [] };
}

export async function writeToRedis(data: StorageData): Promise<void> {
  try {
    await redis.set(STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Redis write error:", e);
  }
}

export async function initializeStorage(): Promise<StorageData> {
  return fetchFromRedis();
}

export async function saveToFile(): Promise<StorageData> {
  const data = await fetchFromRedis();
  return data;
}

export async function addRecord(student: Student): Promise<StorageData> {
  const today = new Date().toISOString().split("T")[0];
  return addRecordWithDate(student, today);
}

export async function addRecordWithDate(student: Student, dateStr: string): Promise<StorageData> {
  const data = await fetchFromRedis();

  const id = `${student}-${dateStr}-${Date.now()}`;
  const newRecord: AttendanceRecord = {
    id,
    student,
    date: dateStr,
    weekDay: getWeekDay(dateStr),
  };

  data.records.push(newRecord);
  data.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  await writeToRedis(data);
  return data;
}

// Server-side helpers for API routes
export async function getStorageData(): Promise<StorageData> {
  return fetchFromRedis();
}

// Client-side helpers (read from localStorage cache)
export function getRecordsByStudentLocal(student: Student): AttendanceRecord[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  const data = JSON.parse(stored) as StorageData;
  return data.records.filter((r) => r.student === student);
}

export function getWeeklyRecordsLocal(student: Student): AttendanceRecord[] {
  const records = getRecordsByStudentLocal(student);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return records.filter((r) => new Date(r.date + "T00:00:00") >= weekStart);
}

export function getMonthlyRecordsLocal(student: Student): AttendanceRecord[] {
  const records = getRecordsByStudentLocal(student);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return records.filter((r) => new Date(r.date + "T00:00:00") >= monthStart);
}

export function getLastClassLocal(student: Student): AttendanceRecord | null {
  const records = getRecordsByStudentLocal(student);
  return records.length > 0 ? records[0] : null;
}

export function getTotalCountLocal(student: Student): number {
  return BASE_COUNT[student] + getRecordsByStudentLocal(student).length;
}

// Aliases for backward compatibility with existing code
export const getRecordsByStudent = getRecordsByStudentLocal;
export const getWeeklyRecords = getWeeklyRecordsLocal;
export const getMonthlyRecords = getMonthlyRecordsLocal;
export const getLastClass = getLastClassLocal;
export const getTotalCount = getTotalCountLocal;

export function downloadCsv(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  const data = JSON.parse(stored) as StorageData;
  const rows = [["Aluno", "Data", "Dia da Semana"]];

  data.records.forEach((r) => {
    rows.push([r.student, r.date, r.weekDay]);
  });

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "attendance.csv";
  a.click();

  URL.revokeObjectURL(url);
}
