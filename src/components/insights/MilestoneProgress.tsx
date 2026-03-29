import { Skill } from "@/lib/types";
import { getTotalHours } from "@/lib/data";
import { resolveSkillColor } from "@/lib/skillColors";
import { motion } from "framer-motion";

interface MilestoneProgressProps {
  skills: Skill[];
  goal?: number;
}

const BLOCKS = 10;

export function MilestoneProgress({ skills, goal = 10000 }: MilestoneProgressProps) {
  const sorted = [...skills].sort((a, b) => getTotalHours(b) - getTotalHours(a));

  return (
    <div className="space-y-5">
      {sorted.map((skill, idx) => {
        const hours = Math.round(getTotalHours(skill));
        const pct = Math.min((hours / goal) * 100, 100);
        const filledBlocks = Math.round((pct / 100) * BLOCKS);

        return (
          <div key={skill.id}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {skill.icon} {skill.name}
              </span>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {pct.toFixed(0)}% — {hours.toLocaleString()}/{goal.toLocaleString()}h
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: BLOCKS }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: idx * 0.05 + i * 0.03, duration: 0.3 }}
                  className="flex-1 h-3 rounded-sm"
                  style={{
                    backgroundColor: i < filledBlocks
                      ? resolveSkillColor(skill, idx)
                      : "hsl(var(--muted))",
                    opacity: i < filledBlocks ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
