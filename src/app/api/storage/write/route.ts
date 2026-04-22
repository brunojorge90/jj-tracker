import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://driven-viper-104620.upstash.io",
  token: "gQAAAAAAAZisAAIgcDE4MzZlYTQ1YzhlOWY0NTZjOGFlZmU3YTJhYzVlMDBkMQ",
});

const STORAGE_KEY = "jj_attendance";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await redis.set(STORAGE_KEY, JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Redis write error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
