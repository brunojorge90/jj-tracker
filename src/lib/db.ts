import "server-only";
import { neon } from "@neondatabase/serverless";
import { getWeekDay, type AttendanceRecord, type Student } from "./types";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = neon(url);

interface Row {
  id: number;
  student: Student;
  date: string;
}

export async function listRecords(): Promise<AttendanceRecord[]> {
  const rows = (await sql`
    SELECT id, student, to_char(date, 'YYYY-MM-DD') AS date
    FROM attendance
    ORDER BY date DESC, id DESC
  `) as Row[];
  return rows.map((r) => ({ ...r, weekDay: getWeekDay(r.date) }));
}

export async function insertRecord(student: Student, date: string): Promise<void> {
  await sql`INSERT INTO attendance (student, date) VALUES (${student}, ${date})`;
}

export async function deleteRecord(id: number): Promise<void> {
  await sql`DELETE FROM attendance WHERE id = ${id}`;
}
