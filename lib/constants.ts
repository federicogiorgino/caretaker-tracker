export const SHIFTS = [
  {
    id: "morning",
    label: "Morning",
    icon: "🌅",
    expectedStart: "08:00",
    expectedEnd: "10:00",
    expectedMins: 120,
  },
  {
    id: "lunch",
    label: "Lunch",
    icon: "☀️",
    expectedStart: "13:00",
    expectedEnd: "14:00",
    expectedMins: 60,
  },
  {
    id: "evening",
    label: "Evening",
    icon: "🌙",
    expectedStart: "20:00",
    expectedEnd: "21:00",
    expectedMins: 60,
  },
] as const;

export type ShiftId = (typeof SHIFTS)[number]["id"];

export const EXPECTED_DAILY_MINS = 240; // 4 hours

/** "08:30" → minutes since midnight */
export function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minutes → "08:30" */
export function minsToTime(mins: number): string {
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** minutes → "2h 30m" display string */
export function minsToDisplay(mins: number): string {
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcMinsWorked(arrivedAt: string, leftAt: string): number {
  const start = timeToMins(arrivedAt);
  const end = timeToMins(leftAt);
  return Math.max(0, end - start);
}

/** Returns Mon–Sat dates for the week containing `date` */
export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

/** All Mon–Sat dates for a given month (year/month are 1-indexed) */
export function getMonthWorkingDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    if (d.getDay() !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];