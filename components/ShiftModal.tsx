"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertShift, deleteShift } from "@/lib/actions";
import {
  SHIFTS, minsToDisplay, timeToMins, calcMinsWorked, type ShiftId,
} from "@/lib/constants";
import { Trash2 } from "lucide-react";

interface ShiftEntry {
  arrivedAt: string;
  leftAt: string;
  minutesWorked: number;
  note?: string | null;
}

interface ShiftModalProps {
  open: boolean;
  onClose: () => void;
  date: string;
  shiftId: ShiftId;
  existing?: ShiftEntry;
}

export function ShiftModal({ open, onClose, date, shiftId, existing }: ShiftModalProps) {
  const shift = SHIFTS.find((s) => s.id === shiftId)!;

  const [arrivedAt, setArrivedAt] = useState(existing?.arrivedAt ?? shift.expectedStart);
  const [leftAt, setLeftAt] = useState(existing?.leftAt ?? shift.expectedEnd);
  const [note, setNote] = useState(existing?.note ?? "");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const worked = calcMinsWorked(arrivedAt, leftAt);
  const diff = worked - shift.expectedMins;
  const isValid = arrivedAt && leftAt && timeToMins(leftAt) > timeToMins(arrivedAt);

  const displayDate = new Date(date + "T12:00:00").toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long",
  });

  function handleSave() {
    if (!isValid) return;
    startTransition(async () => {
      await upsertShift(date, shiftId, arrivedAt, leftAt, note || undefined);
      onClose();
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteShift(date, shiftId);
      onClose();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>{shift.icon}</span>
            <span>Turno {shift.label}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground capitalize">{displayDate}</p>
        </DialogHeader>

        <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2 font-mono">
          Previsto: {shift.expectedStart} – {shift.expectedEnd} ({minsToDisplay(shift.expectedMins)})
        </div>

        {/* Selettori orari */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="arrived">Arrivata</Label>
            <input
              id="arrived"
              type="time"
              value={arrivedAt}
              onChange={(e) => setArrivedAt(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xl font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="left">Andata via</Label>
            <input
              id="left"
              type="time"
              value={leftAt}
              onChange={(e) => setLeftAt(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xl font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Riepilogo */}
        {isValid && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Lavorato</p>
              <p className="text-2xl font-bold font-mono">{minsToDisplay(worked)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Differenza</p>
              <p className={`text-lg font-bold font-mono ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                {diff >= 0 ? "+" : "-"}{minsToDisplay(Math.abs(diff))}
              </p>
            </div>
          </div>
        )}

        {/* Nota */}
        <div className="space-y-2">
          <Label htmlFor="note">Nota (opzionale)</Label>
          <Textarea
            id="note"
            placeholder="es. andata via 30 min prima, ha detto che la nonna stava bene..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {existing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="mr-auto"
            >
              <Trash2 className="size-4" />
              {isDeleting ? "Eliminando..." : "Elimina"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isPending}>
            {isPending ? "Salvataggio..." : existing ? "Aggiorna" : "Salva"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}