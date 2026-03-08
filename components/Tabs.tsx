"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface TabsProps {
  weekTab: ReactNode;
  monthTab: ReactNode;
}

export function Tabs({ weekTab, monthTab }: TabsProps) {
  const [active, setActive] = useState<"week" | "month">("week");

  return (
    <div>
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-6 border border-border">
        {([["week", "📅 Settimana"], ["month", "📊 Rapporto"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${active === id
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "week" ? weekTab : monthTab}
    </div>
  );
}