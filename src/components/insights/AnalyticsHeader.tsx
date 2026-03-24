import { useMemo, useState } from "react";
import { Skill } from "@/lib/types";

type Period = "daily" | "weekly" | "monthly";

interface AnalyticsHeaderProps {
  skills: Skill[];
}

export function AnalyticsHeader({ skills }: AnalyticsHeaderProps) {
  const [period, setPeriod] = useState<Period>("daily");

  const insight = useMemo(() => {
    const allLogs = skills.flatMap((s) =>
      s.logs.map((l) => ({ ...l, skillName: s.name }))
    );

    if (allLogs.length === 0) return { bestLabel: "—", avgMinutes: 0, text: "Log some sessions to see insights." };

    if (period === "daily") {
      // Find best day of week
      const dayTotals = Array(7).fill(0);
      const dayCounts = Array(7).fill(0);
      for (const log of allLogs) {
        const day = new Date(log.date + "T00:00:00").getDay();
        dayTotals[day] += log.duration;
        dayCounts[day]++;
      }
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let bestDay = 0;
      for (let i = 1; i < 7; i++) {
        if (dayTotals[i] > dayTotals[bestDay]) bestDay = i;
      }
      const avg = dayCounts[bestDay] > 0 ? Math.round(dayTotals[bestDay] / dayCounts[bestDay]) : 0;
      return {
        bestLabel: dayNames[bestDay],
        avgMinutes: avg,
        text: `You tend to practice most on ${dayNames[bestDay]}s, averaging ${avg} minutes per session.`,
      };
    }

    if (period === "weekly") {
      // Aggregate by ISO week
      const weekMap = new Map<string, number>();
      for (const log of allLogs) {
        const d = new Date(log.date + "T00:00:00");
        const week = getISOWeek(d);
        weekMap.set(week, (weekMap.get(week) || 0) + log.duration);
      }
      const weeks = Array.from(weekMap.values());
      const avg = weeks.length > 0 ? Math.round(weeks.reduce((a, b) => a + b, 0) / weeks.length) : 0;
      const best = Math.max(...weeks, 0);
      return {
        bestLabel: `${Math.round(best / 60)}h best week`,
        avgMinutes: avg,
        text: `Your average weekly practice is ${Math.round(avg / 60)}h, with your best week hitting ${Math.round(best / 60)}h.`,
      };
    }

    // monthly
    const monthMap = new Map<string, number>();
    for (const log of allLogs) {
      const key = log.date.substring(0, 7);
      monthMap.set(key, (monthMap.get(key) || 0) + log.duration);
    }
    const months = Array.from(monthMap.values());
    const avg = months.length > 0 ? Math.round(months.reduce((a, b) => a + b, 0) / months.length) : 0;
    const best = Math.max(...months, 0);
    return {
      bestLabel: `${Math.round(best / 60)}h best month`,
      avgMinutes: avg,
      text: `Monthly average is ${Math.round(avg / 60)}h. Your most productive month logged ${Math.round(best / 60)}h.`,
    };
  }, [skills, period]);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="font-display text-lg font-semibold">When Do You Actually Perform The Best?</h2>
        <div className="flex items-center gap-1">
          {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
    </div>
  );
}

function getISOWeek(d: Date): string {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-W${weekNum}`;
}
