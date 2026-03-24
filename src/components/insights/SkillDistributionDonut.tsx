import { useMemo } from "react";
import { Skill } from "@/lib/types";
import { getTotalHours } from "@/lib/data";
import { getSkillColors } from "@/lib/skillColors";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

interface SkillDistributionDonutProps {
  skills: Skill[];
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--muted-foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SkillDistributionDonut({ skills }: SkillDistributionDonutProps) {
  const { data, totalHours, colors } = useMemo(() => {
    const data = skills
      .map((s) => ({
        name: `${s.icon} ${s.name}`,
        hours: Math.round(getTotalHours(s)),
      }))
      .filter((d) => d.hours > 0)
      .sort((a, b) => b.hours - a.hours);
    const totalHours = data.reduce((sum, d) => sum + d.hours, 0);
    const colors = getSkillColors(data.length);
    return { data, totalHours, colors };
  }, [skills]);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>;
  }

  return (
    <div className="relative h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="55%"
            outerRadius="78%"
            paddingAngle={2}
            dataKey="hours"
            stroke="none"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value}h`, name]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
            formatter={(value: string) => (
              <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: "-10%" }}>
        <span className="font-display text-3xl font-bold tracking-tighter tabular-nums">
          {totalHours.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">Total Hours</span>
      </div>
    </div>
  );
}
