import { NextResponse } from "next/server";
import { insertRecord, listRecords } from "@/lib/db";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const records = await listRecords();
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { student?: Student; date?: string };

  if (!body.student || (body.student !== "bruno" && body.student !== "fabiola")) {
    return NextResponse.json({ error: "invalid student" }, { status: 400 });
  }
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }

  await insertRecord(body.student, body.date);
  const records = await listRecords();
  return NextResponse.json({ records });
}
