import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: "https://driven-viper-104620.upstash.io",
  token: "gQAAAAAAAZisAAIgcDE4MzZlYTQ1YzhlOWY0NTZjOGFlZmU3YTJhYzVlMDBkMQ",
});

const STORAGE_KEY = "jj_attendance";

export async function GET() {
  try {
    const data = await redis.get<string>(STORAGE_KEY);
    if (data) {
      return NextResponse.json(JSON.parse(data as string));
    }
    return NextResponse.json({ records: [] });
  } catch (error) {
    console.error("Redis read error:", error);
    return NextResponse.json({ records: [] });
  }
}
