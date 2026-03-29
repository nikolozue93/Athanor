import { useState } from "react";
import { useApp } from "@/lib/context";
import { getTotalHours } from "@/lib/data";
import { SkillCard } from "@/components/SkillCard";
import { AddSkillModal } from "@/components/AddSkillModal";
import { SessionIndicator } from "@/components/SessionIndicator";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  const { data } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  const totalHours = data.skills.reduce((sum, s) => sum + getTotalHours(s), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 md:px-12 pt-12 pb-4 flex items-center justify-between max-w-6xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Athanor</h1>
          <p className="text-muted-foreground text-sm mt-1">The long road to mastery.</p>
        </div>
        <div className="flex items-center gap-3">
          <SessionIndicator />
          <Link
            to="/focus"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Focus
          </Link>
          <Link
            to="/stats"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Stats
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="w-10 h-10 rounded-inner border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all active:scale-95"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* Total counter */}
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <p className="text-muted-foreground text-sm mb-1">Total hours invested</p>
          <p className="font-display text-6xl font-semibold tracking-tighter tabular-nums">
            {totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </motion.div>
      </div>

      {/* Skill grid */}
      <div className="px-6 md:px-12 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.skills.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} index={i} />
          ))}

          {/* Add card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: data.skills.length * 0.06 }}
            onClick={() => setAddOpen(true)}
            className="border border-dashed border-border rounded-3xl min-h-[240px] flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all active:scale-[0.98]"
          >
            <Plus size={24} className="mb-2" />
            <span className="text-sm">Add a skill</span>
          </motion.button>
        </div>
      </div>

      <AddSkillModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
};

export default Index;
