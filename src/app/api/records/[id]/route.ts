import { NextResponse } from "next/server";
import { deleteRecord, listRecords } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idNum = Number(id);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await deleteRecord(idNum);
  const records = await listRecords();
  return NextResponse.json({ records });
}
