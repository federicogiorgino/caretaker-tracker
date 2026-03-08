"use client";

import { useState, useEffect } from "react";
import {
  SHIFTS, EXPECTED_DAILY_MINS, minsToDisplay, getMonthWorkingDays, toDateStr,
} from "@/lib/constants";
import type { Shift } from "@/lib/schema";

function diffTextColor(diff: number) {
  if (diff >= 0) return "text-green-400";
  if (diff >= -10) return "text-yellow-400";
  return "text-red-400";
}

function diffBorderBg(diff: number) {
  if (diff >= 0) return "bg-green-500/10 text-green-400 border-green-500/30";
  if (diff >= -10) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/10 text-red-400 border-red-500/30";
}

export function MonthReport() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/report?year=${year}&month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        setShifts(data);
        setLoading(false);
      });
  }, [year, month]);

  const workingDays = getMonthWorkingDays(year, month);
  const totalExpected = workingDays.length * EXPECTED_DAILY_MINS;
  const shiftMap = new Map(shifts.map((s) => [`${s.date}__${s.shiftId}`, s]));
  const totalWorked = shifts.reduce((sum, s) => sum + s.minutesWorked, 0);
  const totalMissing = Math.max(0, totalExpected - totalWorked);
  const totalDiff = totalWorked - totalExpected;
  const coverage = totalExpected > 0 ? Math.round((totalWorked / totalExpected) * 100) : 0;

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  const monthName = new Date(year, month - 1).toLocaleDateString("it-IT", {
    month: "long", year: "numeric",
  });

  return (
    <div>
      {/* Navigazione mese */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
          ← Prec.
        </button>
        <h2 className="font-semibold capitalize">{monthName}</h2>
        <button onClick={nextMonth} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2">
          Succ. →
        </button>
      </div>

      {/* Schede riepilogo */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Previste", value: minsToDisplay(totalExpected), color: "text-foreground" },
          { label: "Registrate", value: minsToDisplay(totalWorked), color: diffTextColor(totalDiff) },
          { label: "Mancanti", value: minsToDisplay(totalMissing), color: totalMissing === 0 ? "text-green-400" : diffTextColor(-totalMissing) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-xl font-bold font-mono ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Barra copertura */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Copertura</span>
          <span className={`font-bold font-mono ${coverage >= 90 ? "text-green-400" : coverage >= 70 ? "text-yellow-400" : "text-red-400"}`}>
            {coverage}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${coverage >= 90 ? "bg-green-500" : coverage >= 70 ? "bg-yellow-500" : "bg-red-500"
              }`}
            style={{ width: `${Math.min(100, coverage)}%` }}
          />
        </div>
      </div>

      {/* Dettaglio giorno per giorno */}
      {loading ? (
        <div className="text-center text-muted-foreground py-12 text-sm">Caricamento...</div>
      ) : (
        <div className="space-y-2">
          {workingDays.map((date) => {
            const dateStr = toDateStr(date);
            const dayMins = SHIFTS.reduce((sum, s) => {
              const entry = shiftMap.get(`${dateStr}__${s.id}`);
              return sum + (entry?.minutesWorked ?? 0);
            }, 0);
            const diff = dayMins - EXPECTED_DAILY_MINS;

            return (
              <div
                key={dateStr}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <span className="w-[105px] text-xs text-muted-foreground font-mono shrink-0 capitalize">
                  {date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}
                </span>

                <div className="flex gap-1.5 flex-1 flex-wrap">
                  {SHIFTS.map((s) => {
                    const entry = shiftMap.get(`${dateStr}__${s.id}`);
                    const sDiff = entry ? entry.minutesWorked - s.expectedMins : null;
                    return (
                      <span
                        key={s.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${entry && sDiff !== null
                          ? diffBorderBg(sDiff)
                          : "bg-muted/30 text-muted-foreground border-border"
                          }`}
                      >
                        {s.icon}{" "}
                        {entry ? `${entry.arrivedAt}–${entry.leftAt}` : "—"}
                        {entry?.note && " 📝"}
                      </span>
                    );
                  })}
                </div>

                <span className={`text-xs font-bold font-mono shrink-0 ${dayMins >= EXPECTED_DAILY_MINS ? "text-green-400" : dayMins > 0 ? diffTextColor(diff) : "text-red-400"
                  }`}>
                  {minsToDisplay(dayMins)}
                </span>

                {dayMins > 0 && (
                  <span className={`text-[10px] font-mono shrink-0 ${diffTextColor(diff)}`}>
                    {diff >= 0 ? "+" : "-"}{minsToDisplay(Math.abs(diff))}
                  </span>
                )}

                <span className="text-sm shrink-0">
                  {dayMins >= EXPECTED_DAILY_MINS ? "✅" : dayMins > 0 ? "⚠️" : "❌"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}