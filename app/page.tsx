import { getShiftsForWeek } from "@/lib/actions";
import { getWeekDates, toDateStr } from "@/lib/constants";
import { WeekView } from "@/components/WeekView";
import { MonthReport } from "@/components/MonthReport";
import { Tabs } from "@/components/Tabs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = new Date();
  const weekDates = getWeekDates(today);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[5];

  const initialShifts = await getShiftsForWeek(toDateStr(weekStart), toDateStr(weekEnd));

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <h1 className="font-bold text-lg leading-tight">Registro Badante</h1>
            <p className="text-xs text-muted-foreground font-mono">
              4h/giorno · Lun–Sab · 08–10, 13–14, 20–21
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Tabs
          weekTab={<WeekView initialShifts={initialShifts} weekStart={weekStart} />}
          monthTab={<MonthReport />}
        />
      </div>
    </main>
  );
}