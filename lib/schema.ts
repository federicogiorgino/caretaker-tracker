import { pgTable, text, integer, serial, uniqueIndex } from "drizzle-orm/pg-core";

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  shiftId: text("shift_id").notNull(),
  arrivedAt: text("arrived_at").notNull(),
  leftAt: text("left_at").notNull(),
  minutesWorked: integer("minutes_worked").notNull(),
  note: text("note"),
}, (table) => ({
  dateShiftUnique: uniqueIndex("date_shift_unique").on(table.date, table.shiftId),
}));

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
