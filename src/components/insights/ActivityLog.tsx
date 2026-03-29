import { useMemo } from "react";
import { Skill } from "@/lib/types";
import { resolveSkillColor } from "@/lib/skillColors";
import { formatDuration } from "@/components/Heatmap";
import { Badge } from "@/components/ui/badge";

interface ActivityLogProps {
  skills: Skill[];
  days?: number;
}

interface GroupedDay {
  dateStr: string;
  dateLabel: string;
  skills: {
    name: string;
    icon: string;
    color: string;
    entries: { note: string; duration: number }[];
    totalMinutes: number;
  }[];
  totalMinutes: number;
}

export function ActivityLog({ skills, days = 7 }: ActivityLogProps) {
  const grouped = useMemo(() => {
    const today = new Date();
    const result: GroupedDay[] = [];

    const skillIndex = new Map<string, number>();
    skills.forEach((s, i) => skillIndex.set(s.id, i));

    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const dateLabel = date.toLocaleDateString("default", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const daySkills: GroupedDay["skills"] = [];

      for (const skill of skills) {
        const entries = skill.logs
          .filter((l) => l.date === dateStr)
          .map((l) => ({
            note: l.note || "Practice session",
            duration: l.duration,
          }));

        if (entries.length > 0) {
          daySkills.push({
            name: skill.name,
            icon: skill.icon,
            color: resolveSkillColor(skill, skillIndex.get(skill.id) || 0),
            entries,
            totalMinutes: entries.reduce((s, e) => s + e.duration, 0),
          });
        }
      }

      if (daySkills.length > 0) {
        result.push({
          dateStr,
          dateLabel,
          skills: daySkills,
          totalMinutes: daySkills.reduce((s, sk) => s + sk.totalMinutes, 0),
        });
      }
    }
    return result;
  }, [skills, days]);

  if (grouped.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>;
  }

  return (
    <div className="space-y-4">
      {grouped.map((day) => (
        <div key={day.dateStr} className="border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{day.dateLabel}</span>
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              {formatDuration(day.totalMinutes)}
            </span>
          </div>
          <div className="space-y-3">
            {day.skills.map((sk) => (
              <div key={sk.name}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sk.color }}
                  />
                  <span className="text-xs font-medium">
                    {sk.icon} {sk.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto font-mono tabular-nums">
                    {formatDuration(sk.totalMinutes)}
                  </span>
                </div>
                <div className="ml-4 space-y-0.5">
                  {sk.entries.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                      <span className="truncate">{entry.note}</span>
                      {entry.duration >= 90 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 animate-pulse bg-primary/15 text-primary border-0"
                        >
                          Deep Work
                        </Badge>
                      )}
                      <span className="ml-auto font-mono tabular-nums flex-shrink-0">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
