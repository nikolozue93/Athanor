import { useMemo } from "react";
import { Skill } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

const BUCKETS = [
  { label: "0–15m", min: 0, max: 15 },
  { label: "15–30m", min: 15, max: 30 },
  { label: "30–60m", min: 30, max: 60 },
  { label: "1–2h", min: 60, max: 120 },
  { label: "2h+", min: 120, max: Infinity },
];

interface SessionIntensityHistogramProps {
  skills: Skill[];
}

export function SessionIntensityHistogram({ skills }: SessionIntensityHistogramProps) {
  const data = useMemo(() => {
    const counts = BUCKETS.map((b) => ({ label: b.label, count: 0 }));
    for (const skill of skills) {
      for (const log of skill.logs) {
        const idx = BUCKETS.findIndex((b) => log.duration >= b.min && log.duration < b.max);
        if (idx !== -1) counts[idx].count++;
      }
    }
    return counts;
  }, [skills]);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} sessions`, "Count"]}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
          />
          <Bar
            dataKey="count"
            fill="hsl(var(--primary))"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
