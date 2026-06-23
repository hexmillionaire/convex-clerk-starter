"use client";

import { useMemo } from "react";

type Props = {
  calendarData: Record<string, number>;
  weeks?: number;
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getIntensity(count: number): string {
  if (count === 0) return "bg-muted border border-border/60";
  if (count === 1) return "bg-green-300 dark:bg-green-800";
  if (count <= 3) return "bg-green-400 dark:bg-green-600";
  if (count <= 5) return "bg-green-500 dark:bg-green-500";
  return "bg-green-600 dark:bg-green-400";
}

export function StreakCalendar({ calendarData, weeks = 13 }: Props) {
  const grid = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const totalDays = weeks * 7;
    const cells: { date: string; count: number; day: number; isToday: boolean }[] = [];

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ date: ds, count: calendarData[ds] ?? 0, day: d.getDay(), isToday: ds === todayStr });
    }

    // Group into weeks (columns)
    const columns: typeof cells[] = [];
    let col: typeof cells = [];
    for (const cell of cells) {
      col.push(cell);
      if (cell.day === 6) {
        columns.push(col);
        col = [];
      }
    }
    if (col.length > 0) columns.push(col);

    return columns;
  }, [calendarData, weeks]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = "";
    grid.forEach((week, i) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = new Date(firstDay.date).toLocaleString("en-US", {
          month: "short",
        });
        if (month !== lastMonth) {
          labels.push({ label: month, col: i });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [grid]);

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {monthLabels.map((m) => (
          <span
            key={`${m.label}-${m.col}`}
            className="text-[10px] text-muted-foreground font-mono"
            style={{
              position: "relative",
              left: `${m.col * 16}px`,
              marginRight: "-8px",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="h-3.5 w-6 text-[9px] text-muted-foreground font-mono flex items-center justify-end pr-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`h-3.5 w-3.5 rounded-sm ${getIntensity(cell.count)} transition-colors ${
                  cell.isToday
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : ""
                }`}
                title={`${cell.date}: ${cell.count} chapter${cell.count !== 1 ? "s" : ""}${cell.isToday ? " (today)" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 ml-8">
        <span className="text-[10px] text-muted-foreground font-mono mr-1">
          Less
        </span>
        {[0, 1, 2, 4, 6].map((n) => (
          <div
            key={n}
            className={`h-2.5 w-2.5 rounded-sm ${getIntensity(n)}`}
          />
        ))}
        <span className="text-[10px] text-muted-foreground font-mono ml-1">
          More
        </span>
      </div>
    </div>
  );
}
