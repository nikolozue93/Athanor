import { useMemo, useState } from "react";
import { useApp } from "@/lib/context";
import { getTotalHours } from "@/lib/data";
import { Heatmap } from "@/components/Heatmap";
import { SkillDistributionDonut } from "@/components/insights/SkillDistributionDonut";
import { SessionIntensityHistogram } from "@/components/insights/SessionIntensityHistogram";
import { MasteryProjection } from "@/components/insights/MasteryProjection";
import { MilestoneProgress } from "@/components/insights/MilestoneProgress";
import { ActivityLog } from "@/components/insights/ActivityLog";
import { AnalyticsHeader } from "@/components/insights/AnalyticsHeader";
import { SessionIndicator } from "@/components/SessionIndicator";
import { motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function StatsPage() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterSkillId = searchParams.get("skill");

  const filteredSkills = useMemo(() => {
    if (!filterSkillId) return data.skills;
    return data.skills.filter((s) => s.id === filterSkillId);
  }, [data.skills, filterSkillId]);

  const filterSkill = filterSkillId ? data.skills.find((s) => s.id === filterSkillId) : null;

  const totalHours = filteredSkills.reduce((sum, s) => sum + getTotalHours(s), 0);
  const totalSessions = filteredSkills.reduce((sum, s) => sum + s.logs.length, 0);

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 md:px-12 pt-8 pb-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <SessionIndicator />
        </div>
      </header>

      <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Stats</h1>
          <p className="text-muted-foreground text-sm">
            {filterSkill
              ? `Showing data for ${filterSkill.icon} ${filterSkill.name}`
              : "Your practice across all skills."}
          </p>
        </motion.div>

        {/* Filter badge */}
        {filterSkill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4"
          >
            <button
              onClick={clearFilter}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {filterSkill.icon} {filterSkill.name}
              <X size={14} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Summary cards */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Total hours", value: totalHours.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
          { label: "Sessions", value: totalSessions.toLocaleString() },
          { label: "Skills", value: filteredSkills.length.toString() },
          {
            label: "Avg per session",
            value: totalSessions > 0
              ? `${((totalHours * 60) / totalSessions).toFixed(0)}m`
              : "—",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.05 }}
            className="bg-card border border-border rounded-3xl p-6"
          >
            <p className="font-display text-3xl font-semibold tracking-tighter tabular-nums">{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Header */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-8">
        <AnalyticsHeader skills={filteredSkills} />
      </div>

      {/* Heatmap */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-12">
        <h2 className="font-display text-lg font-semibold mb-6">Consistency</h2>
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <Heatmap skills={filteredSkills} />
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-heatmap-empty" />
            <div className="w-3 h-3 rounded-sm bg-heatmap-l1" />
            <div className="w-3 h-3 rounded-sm bg-heatmap-l2" />
            <div className="w-3 h-3 rounded-sm bg-heatmap-l3" />
            <div className="w-3 h-3 rounded-sm bg-heatmap-l4" />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-12">
        <h2 className="font-display text-lg font-semibold mb-6">Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Project Distribution</h3>
            <SkillDistributionDonut skills={filteredSkills} />
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Session Intensity</h3>
            <SessionIntensityHistogram skills={filteredSkills} />
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-12">
        <h2 className="font-display text-lg font-semibold mb-6">Milestone Progress</h2>
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <MilestoneProgress skills={filteredSkills} />
        </div>
      </div>

      {/* Activity Log */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-12">
        <h2 className="font-display text-lg font-semibold mb-6">Activity Log</h2>
        <ActivityLog skills={filteredSkills} days={14} />
      </div>

      {/* Mastery Projection */}
      <div className="px-6 md:px-12 max-w-5xl mx-auto pb-12">
        <h2 className="font-display text-lg font-semibold mb-6">Mastery Projection</h2>
        <MasteryProjection skills={filteredSkills} />
      </div>

      {/* Per-skill breakdown */}
      {!filterSkillId && (
        <div className="px-6 md:px-12 max-w-5xl mx-auto pb-16">
          <h2 className="font-display text-lg font-semibold mb-4">By skill</h2>
          <div className="space-y-2">
            {data.skills
              .sort((a, b) => getTotalHours(b) - getTotalHours(a))
              .map((skill) => {
                const h = getTotalHours(skill);
                const pct = Math.min((h / 10000) * 100, 100);
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSearchParams({ skill: skill.id })}
                    className="w-full text-left bg-card border border-border rounded-inner p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {skill.icon} {skill.name}
                      </span>
                      <span className="text-sm font-mono tabular-nums text-muted-foreground">
                        {h.toLocaleString(undefined, { maximumFractionDigits: 0 })}h
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
