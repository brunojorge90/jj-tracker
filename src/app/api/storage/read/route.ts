import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "attendance.json");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function GET() {
  try {
    await ensureDir();
    let raw: string;
    try {
      raw = await readFile(DATA_FILE, "utf-8");
    } catch {
      // File doesn't exist yet — not an error, returns empty
      return NextResponse.json({ records: [], baseCount: { bruno: 46, fabiola: 19 } });
    }
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to read" }, { status: 500 });
  }
}