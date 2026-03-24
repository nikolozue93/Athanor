import { motion } from "framer-motion";
import { Skill } from "@/lib/types";
import { getTotalHours, getProgress } from "@/lib/data";
import { ProgressRing } from "./ProgressRing";
import { useNavigate } from "react-router-dom";

const springConfig = { type: "spring" as const, stiffness: 260, damping: 20 };

interface SkillCardProps {
  skill: Skill;
  index: number;
}

export function SkillCard({ skill, index }: SkillCardProps) {
  const navigate = useNavigate();
  const hours = getTotalHours(skill);
  const progress = getProgress(skill);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: index * 0.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        if (e.shiftKey || e.metaKey || e.ctrlKey) {
          navigate(`/stats?skill=${skill.id}`);
        } else {
          navigate(`/skill/${skill.id}`);
        }
      }}
      onDoubleClick={() => navigate(`/stats?skill=${skill.id}`)}
      className="cursor-pointer bg-card border border-border rounded-3xl p-8 min-h-[240px] flex flex-col justify-between transition-shadow hover:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.03)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl">{skill.icon}</span>
          <h3 className="font-display text-lg font-semibold mt-3">{skill.name}</h3>
        </div>
        <ProgressRing progress={progress} size={56} strokeWidth={2} />
      </div>

      <div className="mt-auto pt-6">
        <p className="font-display text-4xl font-semibold tracking-tighter tabular-nums">
          {hours.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          hours of 10,000
        </p>
      </div>
    </motion.div>
  );
}
