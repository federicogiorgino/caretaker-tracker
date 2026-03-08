import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  const monthStr = String(month).padStart(2, "0");
  const start = `${year}-${monthStr}-01`;
  const end = `${year}-${monthStr}-31`;

  const data = await db
    .select()
    .from(shifts)
    .where(and(gte(shifts.date, start), lte(shifts.date, end)))
    .orderBy(shifts.date, shifts.shiftId);

  return NextResponse.json(data);
}
