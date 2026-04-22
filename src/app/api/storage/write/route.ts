import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "attendance.json");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    await ensureDir();
    const body = await req.json();
    await writeFile(DATA_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to write" }, { status: 500 });
  }
}