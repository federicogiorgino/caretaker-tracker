export const SHIFTS = [
  {
    id: "morning",
    label: "Mattina",
    icon: "🌅",
    expectedStart: "08:00",
    expectedEnd: "10:00",
    expectedMins: 120,
  },
  {
    id: "lunch",
    label: "Pranzo",
    icon: "☀️",
    expectedStart: "13:00",
    expectedEnd: "14:00",
    expectedMins: 60,
  },
  {
    id: "evening",
    label: "Sera",
    icon: "🌙",
    expectedStart: "20:00",
    expectedEnd: "21:00",
    expectedMins: 60,
  },
] as const;

export type ShiftId = (typeof SHIFTS)[number]["id"];

export const EXPECTED_DAILY_MINS = 240; // 4 ore

/** "08:30" → minuti dalla mezzanotte */
export function timeToMins(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** minuti → "2h 30m" */
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

/**
 * Converte una Date in stringa "YYYY-MM-DD" usando l'ora locale,
 * NON UTC — evita lo slittamento di data per fusi orari UTC+x
 */
export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Restituisce le 6 date Lun–Sab della settimana che contiene `date`.
 * Se `date` è domenica, mostra la settimana SUCCESSIVA
 * (la domenica non è un giorno lavorativo).
 */
export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab

  // Domenica → vai al lunedì successivo
  // Lunedì (1) → diff 0, Martedì (2) → diff -1, ..., Sabato (6) → diff -5
  const diff = day === 0 ? 1 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);

  return Array.from({ length: 6 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

/** Tutti i giorni Lun–Sab di un mese (anno/mese 1-indexed) */
export function getMonthWorkingDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    if (d.getDay() !== 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export const DAY_NAMES = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];