import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "start and end required" }, { status: 400 });
  }

  const data = await db
    .select()
    .from(shifts)
    .where(and(gte(shifts.date, start), lte(shifts.date, end)))
    .orderBy(shifts.date, shifts.shiftId);

  return NextResponse.json(data);
}
