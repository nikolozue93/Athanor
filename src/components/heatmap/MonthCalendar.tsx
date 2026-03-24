import { useMemo } from "react";
import { Skill } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, formatDuration } from "../Heatmap";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthCalendarProps {
  skills: Skill[];
}

function getLevel(mins: number) {
  if (mins >= 120) return 4;
  if (mins >= 60) return 3;
  if (mins >= 30) return 2;
  if (mins > 0) return 1;
  return 0;
}

const levelColors = [
  "bg-heatmap-empty",
  "bg-heatmap-l1",
  "bg-heatmap-l2",
  "bg-heatmap-l3",
  "bg-heatmap-l4",
];

export function MonthCalendar({ skills }: MonthCalendarProps) {
  const { calendarDays } = useMemo(() => {
    const map = new Map<string, { minutes: number; sessions: number; skillNames: Set<string> }>();
    for (const skill of skills) {
      for (const log of skill.logs) {
        const existing = map.get(log.date);
        if (existing) {
          existing.minutes += log.duration;
          existing.sessions += 1;
          existing.skillNames.add(`${skill.icon} ${skill.name}`);
        } else {
          map.set(log.date, { minutes: log.duration, sessions: 1, skillNames: new Set([`${skill.icon} ${skill.name}`]) });
        }
      }
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 30);

    // Pad to fill calendar from Sunday
    const firstDayOfWeek = startDate.getDay();
    const calStart = new Date(startDate);
    calStart.setDate(calStart.getDate() - firstDayOfWeek);

    // Pad end to Saturday
    const totalDaysNeeded = Math.ceil(
      (today.getTime() - calStart.getTime()) / (1000 * 60 * 60 * 24) + 1
    );
    const gridDays = Math.ceil(totalDaysNeeded / 7) * 7;

    const calendarDays: {
      date: string;
      dayNum: number;
      level: number;
      minutes: number;
      sessions: number;
      skillNames: string[];
      inRange: boolean;
    }[] = [];

    for (let i = 0; i < gridDays; i++) {
      const d = new Date(calStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = map.get(dateStr);
      const mins = entry?.minutes || 0;
      const inRange = d >= startDate && d <= today;

      calendarDays.push({
        date: dateStr,
        dayNum: d.getDate(),
        level: getLevel(mins),
        minutes: mins,
        sessions: entry?.sessions || 0,
        skillNames: entry ? Array.from(entry.skillNames) : [],
        inRange,
      });
    }

    return { calendarDays };
  }, [skills]);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-7 gap-1.5">
        {/* Day headers */}
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
        {/* Day cells */}
        {calendarDays.map((day, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors hover:ring-1 hover:ring-foreground/20 ${
                  day.inRange ? levelColors[day.level] : "bg-transparent"
                } ${!day.inRange ? "opacity-30" : ""}`}
              >
                <span className="text-xs tabular-nums text-foreground/70">{day.dayNum}</span>
                {day.minutes > 0 && day.inRange && (
                  <span className="text-[10px] text-foreground/50 tabular-nums mt-0.5">
                    {Math.round(day.minutes / 60) > 0 ? `${Math.round(day.minutes / 60)}h` : `${day.minutes}m`}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-popover border border-border rounded-xl px-3 py-2 shadow-lg">
              <p className="font-medium text-xs text-foreground">{formatDate(day.date)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatDuration(day.minutes)}</p>
              {day.sessions > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {day.sessions} session{day.sessions !== 1 ? "s" : ""}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {day.skillNames.map((name) => (
                      <p key={name} className="text-xs text-muted-foreground">{name}</p>
                    ))}
                  </div>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
