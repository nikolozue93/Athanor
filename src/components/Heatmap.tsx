import { useMemo, useState } from "react";
import { Skill } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WeekBarChart } from "./heatmap/WeekBarChart";
import { MonthCalendar } from "./heatmap/MonthCalendar";

type TimeRange = "1w" | "1m" | "ytd" | "1y" | "all";

interface HeatmapProps {
  skills: Skill[];
}

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1w", label: "1 Week" },
  { value: "1m", label: "1 Month" },
  { value: "ytd", label: "This Year" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

function getRangeDays(range: TimeRange): number {
  switch (range) {
    case "1w": return 7;
    case "1m": return 31;
    case "ytd": {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    case "1y": return 365;
    case "all": return 365 * 3;
  }
}

export type DayData = {
  date: string;
  level: number;
  minutes: number;
  sessions: number;
  skillNames: string[];
};

function buildDayMap(skills: Skill[]) {
  const map = new Map<string, { minutes: number; sessions: number; skillNames: Set<string> }>();
  for (const skill of skills) {
    for (const log of skill.logs) {
      const existing = map.get(log.date);
      if (existing) {
        existing.minutes += log.duration;
        existing.sessions += 1;
        existing.skillNames.add(`${skill.icon} ${skill.name}`);
      } else {
        map.set(log.date, {
          minutes: log.duration,
          sessions: 1,
          skillNames: new Set([`${skill.icon} ${skill.name}`]),
        });
      }
    }
  }
  return map;
}

function getLevel(mins: number) {
  if (mins >= 120) return 4;
  if (mins >= 60) return 3;
  if (mins >= 30) return 2;
  if (mins > 0) return 1;
  return 0;
}

export function formatDuration(mins: number) {
  if (mins === 0) return "No practice";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Heatmap({ skills }: HeatmapProps) {
  const [range, setRange] = useState<TimeRange>("1y");

  const { cells, months, totalMinutes, activeDays } = useMemo(() => {
    const map = buildDayMap(skills);
    const totalDays = getRangeDays(range);
    const today = new Date();
    const cells: DayData[] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);
    const dayOfWeek = startDate.getDay();
    const gridStart = new Date(startDate);
    gridStart.setDate(gridStart.getDate() - dayOfWeek);

    const gridEnd = new Date(today);
    const gridDays = Math.ceil((gridEnd.getTime() - gridStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalGridDays = Math.ceil(gridDays / 7) * 7;

    let totalMinutes = 0;
    let activeDays = 0;

    for (let i = 0; i < totalGridDays; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = map.get(dateStr);
      const mins = entry?.minutes || 0;
      const sessions = entry?.sessions || 0;
      const skillNames = entry ? Array.from(entry.skillNames) : [];

      const isInRange = d >= startDate && d <= today;
      if (isInRange && mins > 0) {
        totalMinutes += mins;
        activeDays++;
      }

      cells.push({ date: dateStr, level: getLevel(mins), minutes: mins, sessions, skillNames });

      const col = Math.floor(i / 7);
      const month = d.getMonth();
      if (month !== lastMonth && d.getDay() === 0) {
        monthLabels.push({ label: d.toLocaleString("default", { month: "short" }), col });
        lastMonth = month;
      }
    }

    return { cells, months: monthLabels, totalMinutes, activeDays, totalDays };
  }, [skills, range]);

  const levelColors = [
    "bg-heatmap-empty",
    "bg-heatmap-l1",
    "bg-heatmap-l2",
    "bg-heatmap-l3",
    "bg-heatmap-l4",
  ];

  const weeks: DayData[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const isWeekView = range === "1w";
  const isMonthView = range === "1m";

  return (
    <div className="space-y-4">
      {/* Range selector */}
      <div className="flex items-center gap-1 flex-wrap">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              range === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="flex gap-6 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular-nums">{formatDuration(totalMinutes)}</span> total
        </span>
        <span>
          <span className="font-semibold text-foreground tabular-nums">{activeDays}</span> active days
        </span>
        <span>
          <span className="font-semibold text-foreground tabular-nums">
            {activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0}m
          </span> avg/day
        </span>
      </div>

      {/* Adaptive layout */}
      {isWeekView ? (
        <WeekBarChart skills={skills} />
      ) : isMonthView ? (
        <MonthCalendar skills={skills} />
      ) : (
        <TooltipProvider delayDuration={100}>
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex mb-1 ml-0">
                {months.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs text-muted-foreground font-mono"
                    style={{ position: "relative", left: `${m.col * 16}px` }}
                  >
                    {i === 0 || months[i - 1].col + 4 < m.col ? m.label : ""}
                  </span>
                ))}
              </div>
              <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((cell, di) => (
                      <Tooltip key={di}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3 h-3 rounded-sm transition-colors duration-500 cursor-pointer hover:ring-1 hover:ring-foreground/20 ${levelColors[cell.level]}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-popover border border-border rounded-xl px-3 py-2 shadow-lg"
                        >
                          <p className="font-medium text-xs text-foreground">{formatDate(cell.date)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDuration(cell.minutes)}</p>
                          {cell.sessions > 0 && (
                            <>
                              <p className="text-xs text-muted-foreground">
                                {cell.sessions} session{cell.sessions !== 1 ? "s" : ""}
                              </p>
                              <div className="mt-1 space-y-0.5">
                                {cell.skillNames.map((name) => (
                                  <p key={name} className="text-xs text-muted-foreground">{name}</p>
                                ))}
                              </div>
                            </>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
