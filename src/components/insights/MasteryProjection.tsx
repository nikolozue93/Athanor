import { useMemo, useState } from "react";
import { Skill } from "@/lib/types";
import { getTotalHours } from "@/lib/data";
import { motion } from "framer-motion";
import { Target, Zap, TrendingUp, Sparkles, CalendarClock } from "lucide-react";

interface MasteryProjectionProps {
  skills: Skill[];
}

const DEFAULT_TIERS = [
  { hours: 0, label: "Beginner" },
  { hours: 1000, label: "Initiate" },
  { hours: 4000, label: "Practitioner" },
  { hours: 7000, label: "Expert" },
  { hours: 10000, label: "Master" },
];

const SKILL_TIERS: Record<string, { hours: number; label: string }[]> = {
  Programming: [
    { hours: 0, label: "Newbie" },
    { hours: 100, label: "Script Kiddie" },
    { hours: 1000, label: "Developer" },
    { hours: 5000, label: "Engineer" },
    { hours: 10000, label: "Architect" },
  ],
  Piano: [
    { hours: 0, label: "Beginner" },
    { hours: 100, label: "Novice" },
    { hours: 1000, label: "Performer" },
    { hours: 5000, label: "Virtuoso" },
    { hours: 10000, label: "Maestro" },
  ],
  Drawing: [
    { hours: 0, label: "Doodler" },
    { hours: 100, label: "Sketcher" },
    { hours: 1000, label: "Illustrator" },
    { hours: 5000, label: "Artist" },
    { hours: 10000, label: "Master Artist" },
  ],
  Writing: [
    { hours: 0, label: "Scribbler" },
    { hours: 100, label: "Blogger" },
    { hours: 1000, label: "Writer" },
    { hours: 5000, label: "Author" },
    { hours: 10000, label: "Wordsmith" },
  ],
};

function getTiersForSkills(skills: Skill[]) {
  if (skills.length === 1) {
    const name = skills[0].name;
    if (SKILL_TIERS[name]) return SKILL_TIERS[name];
    if (skills[0].customTiers) return skills[0].customTiers.tiers;
  }
  return DEFAULT_TIERS;
}

function getCurrentTier(hours: number, tiers: typeof DEFAULT_TIERS) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (hours >= tiers[i].hours) return { current: tiers[i], next: tiers[i + 1] || null, index: i };
  }
  return { current: tiers[0], next: tiers[1], index: 0 };
}

function formatProjectionDate(date: Date) {
  return date.toLocaleDateString("default", { month: "long", year: "numeric" });
}

export function MasteryProjection({ skills }: MasteryProjectionProps) {
  const [targetYear, setTargetYear] = useState<number | null>(null);
  const [showTargetInput, setShowTargetInput] = useState(false);

  const tiers = useMemo(() => getTiersForSkills(skills), [skills]);

  const projection = useMemo(() => {
    const totalHours = skills.reduce((sum, s) => sum + getTotalHours(s), 0);
    const totalSessions = skills.reduce((sum, s) => sum + s.logs.length, 0);
    if (totalSessions === 0) return null;

    const allLogs = skills.flatMap((s) => s.logs);
    const allDates = allLogs.map((l) => l.date);
    if (allDates.length === 0) return null;

    const sortedDates = allDates.sort();
    const earliest = new Date(sortedDates[0] + "T00:00:00");
    const totalDays = Math.max(1, (Date.now() - earliest.getTime()) / (1000 * 60 * 60 * 24));

    const avgMinutesPerSession = (totalHours * 60) / totalSessions;
    const sessionsPerDay = totalSessions / totalDays;
    const steadyHoursPerDay = (avgMinutesPerSession * sessionsPerDay) / 60;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split("T")[0];
    const recentLogs = allLogs.filter((l) => l.date >= thirtyDaysStr);
    const recentMinutes = recentLogs.reduce((sum, l) => sum + l.duration, 0);
    const turboHoursPerDay = recentMinutes / 60 / 30;

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split("T")[0];
    const weekLogs = allLogs.filter((l) => l.date >= sevenDaysStr);
    const weekMinutes = weekLogs.reduce((sum, l) => sum + l.duration, 0);
    const weekHours = weekMinutes / 60;

    const remainingHours = Math.max(0, 10000 - totalHours);
    let daysPulledForward = 0;
    if (steadyHoursPerDay > 0 && weekHours > 0) {
      const remainingWithout = remainingHours + weekHours;
      const daysWithout = remainingWithout / steadyHoursPerDay;
      const daysWith = remainingHours / steadyHoursPerDay;
      daysPulledForward = Math.round(daysWithout - daysWith);
    }

    const steadyDate = new Date();
    if (steadyHoursPerDay > 0) {
      steadyDate.setDate(steadyDate.getDate() + remainingHours / steadyHoursPerDay);
    }

    const turboDate = new Date();
    if (turboHoursPerDay > 0) {
      turboDate.setDate(turboDate.getDate() + remainingHours / turboHoursPerDay);
    }

    const tier = getCurrentTier(totalHours, tiers);
    const tierStart = tier.current.hours;
    const tierEnd = tier.next ? tier.next.hours : 10000;
    const tierProgress = Math.min(((totalHours - tierStart) / (tierEnd - tierStart)) * 100, 100);

    // Target mode calculation
    let targetDailyHours: number | null = null;
    if (targetYear) {
      const targetDate = new Date(targetYear, 11, 31);
      const daysUntilTarget = Math.max(1, (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      targetDailyHours = remainingHours / daysUntilTarget;
    }

    return {
      totalHours: Math.round(totalHours),
      avgMinutesPerSession: Math.round(avgMinutesPerSession),
      sessionsPerDay: sessionsPerDay.toFixed(1),
      steadyHoursPerDay: steadyHoursPerDay.toFixed(1),
      turboHoursPerDay: turboHoursPerDay.toFixed(1),
      steadyDate,
      turboDate,
      hasTurbo: turboHoursPerDay > 0,
      tier,
      tierProgress,
      tierEnd,
      daysPulledForward,
      overallProgress: Math.min((totalHours / 10000) * 100, 100),
      targetDailyHours,
    };
  }, [skills, tiers, targetYear]);

  if (!projection) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 text-center text-sm text-muted-foreground">
        Log some sessions to see your mastery projection.
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-3xl p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-inner bg-primary/10 flex items-center justify-center">
          <Target size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Mastery Projection</h3>
          <p className="text-xs text-muted-foreground">Your path to 10,000 hours</p>
        </div>
      </div>

      {/* Tier progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground tabular-nums">
            {projection.totalHours.toLocaleString()}h
          </span>
          <span className="font-medium text-foreground flex items-center gap-1">
            <Sparkles size={12} className="text-primary" />
            Next: {projection.tier.next?.label || "Master"} ({projection.tierEnd.toLocaleString()}h)
          </span>
        </div>

        {/* Gradient progress bar */}
        <div className="relative">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${projection.tierProgress}%` }}
              transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(var(--mastery-start)), hsl(var(--mastery-end)))`,
              }}
            />
          </div>

          {/* Tier markers on overall 10k bar */}
          <div className="mt-3 h-1.5 bg-muted/60 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${projection.overallProgress}%` }}
              transition={{ duration: 1.4, ease: [0.2, 0, 0, 1] }}
              className="h-full rounded-full bg-primary/40"
            />
            {tiers.slice(1, -1).map((t) => (
              <div
                key={t.hours}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-foreground/20"
                style={{ left: `${(t.hours / 10000) * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {tiers.map((t) => (
              <span
                key={t.hours}
                className={`text-[9px] font-mono ${
                  projection.totalHours >= t.hours ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 tabular-nums">
          Level:{" "}
          <span className="font-semibold text-foreground">{projection.tier.current.label}</span>
          {" · "}
          {projection.tierProgress.toFixed(0)}% to {projection.tier.next?.label || "Master"}
        </p>
      </div>

      {/* Dual projection dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-muted rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Steady Pace</p>
          </div>
          <p className="font-display text-lg font-semibold">
            {formatProjectionDate(projection.steadyDate)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
            {projection.steadyHoursPerDay}h/day (all-time avg)
          </p>
        </div>

        {projection.hasTurbo && (
          <div className="bg-primary/8 border border-primary/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-primary" />
              <p className="text-xs text-primary font-semibold">Turbo Pace</p>
            </div>
            <p className="font-display text-lg font-semibold">
              {formatProjectionDate(projection.turboDate)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
              {projection.turboHoursPerDay}h/day (last 30 days)
            </p>
          </div>
        )}
      </div>

      {/* Target Mode */}
      <div className="mb-6">
        {showTargetInput ? (
          <div className="bg-muted rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock size={14} className="text-primary" />
              <p className="text-xs text-primary font-semibold">Target Mode</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground">Master by</label>
              <select
                value={targetYear || currentYear + 5}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="bg-background border border-border rounded-inner px-3 py-2 text-sm font-mono"
              >
                {Array.from({ length: 20 }, (_, i) => currentYear + 1 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={() => { setShowTargetInput(false); setTargetYear(null); }}
                className="text-xs text-muted-foreground hover:text-foreground ml-auto"
              >
                Clear
              </button>
            </div>
            {projection.targetDailyHours !== null && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm">
                  Required:{" "}
                  <span className="font-display font-semibold text-lg text-primary tabular-nums">
                    {projection.targetDailyHours.toFixed(1)}h/day
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {projection.targetDailyHours <= Number(projection.steadyHoursPerDay)
                    ? "✅ You're already on track at your current pace!"
                    : `⚡ That's ${(projection.targetDailyHours / Number(projection.steadyHoursPerDay)).toFixed(1)}x your current pace`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => { setShowTargetInput(true); setTargetYear(currentYear + 5); }}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarClock size={14} /> Set a target year
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-muted-foreground">Avg/session</p>
          <p className="font-display text-lg font-semibold tabular-nums">
            {projection.avgMinutesPerSession}m
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sessions/day</p>
          <p className="font-display text-lg font-semibold tabular-nums">
            {projection.sessionsPerDay}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Hours/day</p>
          <p className="font-display text-lg font-semibold tabular-nums">
            {projection.steadyHoursPerDay}h
          </p>
        </div>
      </div>

      {/* Insight: time pulled forward */}
      {projection.daysPulledForward > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-primary/8 border border-primary/15 rounded-xl px-4 py-3 flex items-start gap-3"
        >
          <Sparkles size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground leading-relaxed">
            Your activity this week has moved your mastery date{" "}
            <span className="font-semibold text-primary">
              {projection.daysPulledForward} day{projection.daysPulledForward !== 1 ? "s" : ""} closer
            </span>
            ! Keep it up.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
