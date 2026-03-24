import { useMemo } from "react";
import { Skill } from "@/lib/types";
import { getSkillColors } from "@/lib/skillColors";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeekBarChartProps {
  skills: Skill[];
}

export function WeekBarChart({ skills }: WeekBarChartProps) {
  const { data, skillNames, colors } = useMemo(() => {
    const today = new Date();
    const skillNames = skills.map((s) => `${s.icon} ${s.name}`);
    const colors = getSkillColors(skills.length);

    const days: Record<string, unknown>[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const row: Record<string, unknown> = { day: DAY_LABELS[d.getDay()] };

      for (const skill of skills) {
        const key = `${skill.icon} ${skill.name}`;
        let totalMins = 0;
        for (const log of skill.logs) {
          if (log.date === dateStr) totalMins += log.duration;
        }
        row[key] = +(totalMins / 60).toFixed(2);
      }
      days.push(row);
    }
    return { data: days, skillNames, colors };
  }, [skills]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}h`}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value}h`, name]}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
          />
          {skillNames.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={colors[i]}
              radius={i === skillNames.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={48}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
