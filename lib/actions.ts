"use server";

import { db } from "./db";
import { shifts } from "./schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { calcMinsWorked } from "./constants";
import { revalidatePath } from "next/cache";

export async function upsertShift(
  date: string,
  shiftId: string,
  arrivedAt: string,
  leftAt: string,
  note?: string,
  untracked?: boolean,
) {
  const minutesWorked = calcMinsWorked(arrivedAt, leftAt);

  await db
    .insert(shifts)
    .values({ date, shiftId, arrivedAt, leftAt, minutesWorked, note: note ?? null, untracked: untracked ?? false })
    .onConflictDoUpdate({
      target: [shifts.date, shifts.shiftId],
      set: { arrivedAt, leftAt, minutesWorked, note: note ?? null, untracked: untracked ?? false },
    });

  revalidatePath("/");
}

export async function deleteShift(date: string, shiftId: string) {
  await db.delete(shifts).where(and(eq(shifts.date, date), eq(shifts.shiftId, shiftId)));
  revalidatePath("/");
}

export async function getShiftsForWeek(weekStart: string, weekEnd: string) {
  return db.select().from(shifts)
    .where(and(gte(shifts.date, weekStart), lte(shifts.date, weekEnd)))
    .orderBy(shifts.date, shifts.shiftId);
}

export async function getShiftsForMonth(year: number, month: number) {
  const monthStr = String(month).padStart(2, "0");
  return db.select().from(shifts)
    .where(and(gte(shifts.date, `${year}-${monthStr}-01`), lte(shifts.date, `${year}-${monthStr}-31`)))
    .orderBy(shifts.date, shifts.shiftId);
}

export async function getMonthSummary(year: number, month: number) {
  const monthStr = String(month).padStart(2, "0");
  const result = await db
    .select({
      totalMinutes: sql<number>`SUM(${shifts.minutesWorked})`,
      shiftCount: sql<number>`COUNT(*)`,
    })
    .from(shifts)
    .where(and(gte(shifts.date, `${year}-${monthStr}-01`), lte(shifts.date, `${year}-${monthStr}-31`)));
  return result[0] ?? { totalMinutes: 0, shiftCount: 0 };
}