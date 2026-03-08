"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShiftModal } from "@/components/ShiftModal";
import {
  SHIFTS, EXPECTED_DAILY_MINS, minsToDisplay, getWeekDates, toDateStr, DAY_NAMES,
  type ShiftId,
} from "@/lib/constants";
import type { Shift } from "@/lib/schema";

// diff >= 0: verde, diff >= -10: giallo, diff < -10: rosso
function diffTextColor(diff: number) {
  if (diff >= 0) return "text-green-400";
  if (diff >= -10) return "text-yellow-400";
  return "text-red-400";
}

function diffBorderBg(diff: number, untracked?: boolean | null) {
  if (untracked) return "border-blue-500/40 bg-blue-500/10";
  if (diff >= 0) return "border-green-500/40 bg-green-500/10";
  if (diff >= -10) return "border-yellow-500/40 bg-yellow-500/10";
  return "border-red-500/40 bg-red-500/10";
}

interface WeekViewProps {
  initialShifts: Shift[];
  weekStart: Date;
}

export function WeekView({ initialShifts, weekStart: initialWeekStart }: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [modal, setModal] = useState<{ date: string; shiftId: ShiftId } | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const weekDates = getWeekDates(weekStart);
  const today = toDateStr(new Date());

  async function loadWeek(newStart: Date) {
    setLoadingWeek(true);
    const dates = getWeekDates(newStart);
    const start = toDateStr(dates[0]);
    const end = toDateStr(dates[5]);
    const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
    const data = await res.json();
    setShifts(data);
    setWeekStart(newStart);
    setLoadingWeek(false);
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    loadWeek(d);
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    loadWeek(d);
  }

  function getEntry(dateStr: string, shiftId: string) {
    return shifts.find((s) => s.date === dateStr && s.shiftId === shiftId);
  }

  function getDayMins(dateStr: string) {
    return shifts
      .filter((s) => s.date === dateStr)
      .reduce((sum, s) => sum + s.minutesWorked, 0);
  }

  const weeklyWorked = weekDates.reduce((sum, d) => sum + getDayMins(toDateStr(d)), 0);
  const weeklyExpected = 6 * EXPECTED_DAILY_MINS;
  const weekPct = Math.min(100, Math.round((weeklyWorked / weeklyExpected) * 100));
  const activeEntry = modal ? getEntry(modal.date, modal.shiftId) : undefined;

  const weekLabel = `${weekDates[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${weekDates[5].toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div>
      {/* Navigazione settimana */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={prevWeek} disabled={loadingWeek}>
          <ChevronLeft className="size-4" />
          Prec.
        </Button>
        <div className="text-center">
          <p className="font-semibold text-sm">{weekLabel}</p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {minsToDisplay(weeklyWorked)} / {minsToDisplay(weeklyExpected)} registrati
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={nextWeek} disabled={loadingWeek}>
          Succ.
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Barra progresso settimanale */}
      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${weekPct >= 100 ? "bg-green-500" : weekPct >= 70 ? "bg-yellow-500" : "bg-red-500"
            }`}
          style={{ width: `${weekPct}%` }}
        />
      </div>

      {/* Righe giorni */}
      <div className="space-y-3">
        {weekDates.map((date, i) => {
          const dateStr = toDateStr(date);
          const isToday = dateStr === today;
          const dayMins = getDayMins(dateStr);
          const dayDiff = dayMins - EXPECTED_DAILY_MINS;
          const complete = dayMins >= EXPECTED_DAILY_MINS;

          return (
            <div
              key={dateStr}
              className={`rounded-xl border p-3 transition-colors ${isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                }`}
            >
              {/* Intestazione giorno */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isToday ? "text-primary" : ""}`}>
                    {DAY_NAMES[i]}
                  </span>
                  {isToday && (
                    <Badge variant="default" className="text-[10px] py-0 px-1.5">
                      Oggi
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {date.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`font-bold font-mono text-sm ${complete ? "text-green-400" : dayMins > 0 ? diffTextColor(dayDiff) : "text-muted-foreground"
                    }`}>
                    {minsToDisplay(dayMins)}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono"> / 4h</span>
                  {dayMins > 0 && (
                    <span className={`text-xs font-mono ml-1.5 ${diffTextColor(dayDiff)}`}>
                      ({dayDiff >= 0 ? "+" : "-"}{minsToDisplay(Math.abs(dayDiff))})
                    </span>
                  )}
                </div>
              </div>

              {/* Tessere turni */}
              <div className="grid grid-cols-3 gap-2">
                {SHIFTS.map((shift) => {
                  const entry = getEntry(dateStr, shift.id);
                  const sMins = entry?.minutesWorked ?? 0;
                  const sDiff = entry ? sMins - shift.expectedMins : null;

                  return (
                    <button
                      key={shift.id}
                      onClick={() => setModal({ date: dateStr, shiftId: shift.id as ShiftId })}
                      className={`rounded-lg border p-2.5 text-center transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${entry && sDiff !== null
                        ? diffBorderBg(sDiff, entry.untracked)
                        : "border-border bg-background hover:bg-muted/50"
                        }`}
                    >
                      <div className="text-lg mb-0.5">{shift.icon}</div>
                      <div className="text-[11px] font-semibold font-mono">{shift.label}</div>
                      <div className="text-[9px] text-muted-foreground">
                        {shift.expectedStart}–{shift.expectedEnd}
                      </div>

                      {entry ? (
                        <>
                          <div className="text-[10px] font-mono mt-1.5 leading-tight">
                            {entry.arrivedAt}<br />{entry.leftAt}
                          </div>
                          {sDiff !== null && (
                            <div className={`text-[10px] font-bold font-mono mt-1 ${entry.untracked ? "text-blue-400" : diffTextColor(sDiff)}`}>
                              {entry.untracked ? "~" : sDiff >= 0 ? "+" : "-"}{minsToDisplay(Math.abs(sDiff))}
                            </div>
                          )}
                          {entry.note && (
                            <div className="text-[9px] text-muted-foreground mt-1 truncate" title={entry.note}>
                              📝 {entry.note}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-[9px] text-muted-foreground mt-1.5">tocca per registrare</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modale */}
      {modal && (
        <ShiftModal
          open={!!modal}
          onClose={async () => {
            const dates = getWeekDates(weekStart);
            const start = toDateStr(dates[0]);
            const end = toDateStr(dates[5]);
            const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
            const data = await res.json();
            setShifts(data);
            setModal(null);
          }}
          date={modal.date}
          shiftId={modal.shiftId}
          existing={
            activeEntry
              ? {
                arrivedAt: activeEntry.arrivedAt,
                leftAt: activeEntry.leftAt,
                minutesWorked: activeEntry.minutesWorked,
                note: activeEntry.note,
              }
              : undefined
          }
        />
      )}
    </div>
  );
}