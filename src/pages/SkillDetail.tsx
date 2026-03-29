import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/context";
import { getTotalHours, getProgress, getAverageDailyHours, getEstimatedCompletionDate } from "@/lib/data";
import { ProgressRing } from "@/components/ProgressRing";
import { LogModal } from "@/components/LogModal";
import { TaskManager } from "@/components/TaskManager";
import { SessionIndicator } from "@/components/SessionIndicator";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Play, Plus, Save, Trash2, X } from "lucide-react";
import { resolveSkillColor } from "@/lib/skillColors";

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSkill, deleteSkill, updateLog, deleteLog, getSkillIndex } = useApp();
  const [logOpen, setLogOpen] = useState(false);

  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editDuration, setEditDuration] = useState(0);
  const [editTaskId, setEditTaskId] = useState<string>("");
  const [editNote, setEditNote] = useState("");

  const skill = getSkill(id || "");
  if (!skill) return <div className="p-12 text-center text-muted-foreground">Skill not found.</div>;

  const skillIndex = getSkillIndex(skill.id);
  const skillColor = resolveSkillColor(skill, skillIndex);

  const hours = getTotalHours(skill);
  const progress = getProgress(skill);
  const avgDaily = getAverageDailyHours(skill);
  const estimated = getEstimatedCompletionDate(skill);
  const remaining = Math.max(0, 10000 - hours);

  const tasks = skill.tasks || [];
  function startEdit(logId: string) {
    const target = skill.logs.find((log) => log.id === logId);
    if (!target) return;
    setEditingLogId(logId);
    setEditDate(target.date);
    setEditDuration(target.duration);
    setEditTaskId(target.taskId || "");
    setEditNote(target.note || "");
  }

  function cancelEdit() {
    setEditingLogId(null);
    setEditDate("");
    setEditDuration(0);
    setEditTaskId("");
    setEditNote("");
  }

  function saveEdit() {
    if (!editingLogId || editDuration <= 0) return;
    updateLog(skill.id, editingLogId, {
      date: editDate,
      duration: editDuration,
      taskId: editTaskId || undefined,
      note: editNote.trim() || undefined,
    });
    cancelEdit();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 md:px-12 pt-8 pb-4 flex items-center justify-between max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-2">
          <SessionIndicator />
          <button
            onClick={() => navigate("/focus")}
            className="flex items-center gap-2 border border-border rounded-inner px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Play size={14} /> Focus
          </button>
          <button
            onClick={() => setLogOpen(true)}
            className="flex items-center gap-2 text-primary-foreground rounded-inner px-4 py-2 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: skillColor }}
          >
            <Plus size={16} /> Log time
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this skill and all its logs?")) {
                deleteSkill(skill.id);
                navigate("/");
              }
            }}
            className="w-9 h-9 rounded-inner border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </header>

      {/* Big ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        className="flex flex-col items-center py-12 md:py-16 max-w-4xl mx-auto"
      >
        <span className="text-5xl mb-6">{skill.icon}</span>
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">{skill.name}</h1>

        <div className="relative">
          <ProgressRing progress={progress} size={220} strokeWidth={3} color={skillColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-5xl font-semibold tracking-tighter tabular-nums">
              {remaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-muted-foreground text-sm mt-1">hours remaining</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="px-6 md:px-12 max-w-4xl mx-auto grid grid-cols-3 gap-4 mb-12">
        {[
          { label: "Hours logged", value: hours.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
          { label: "Daily average", value: `${avgDaily.toFixed(1)}h` },
          {
            label: "Mastery date",
            value: estimated
              ? estimated.toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-3xl p-6 text-center">
            <p className="font-display text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Task Manager */}
      <div className="px-6 md:px-12 max-w-4xl mx-auto mb-12">
        <TaskManager skillId={skill.id} skillIndex={skillIndex} />
      </div>

      {/* Time logs */}
      <div className="px-6 md:px-12 max-w-4xl mx-auto pb-16">
        <h2 className="font-display text-lg font-semibold mb-4">Recent practice</h2>
        {skill.logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No entries yet. Log your first session.</p>
        ) : (
          <div className="space-y-1">
            {skill.logs.slice(0, 30).map((log) => {
              const taskName = tasks.find((t) => t.id === log.taskId)?.name;
              const isEditing = editingLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 px-4 rounded-inner hover:bg-muted/50 transition-colors group"
                >
                  {isEditing ? (
                    <div className="w-full flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-background border border-border rounded-inner px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          min={1}
                          value={editDuration}
                          onChange={(e) => setEditDuration(Math.max(1, Number(e.target.value) || 1))}
                          className="bg-background border border-border rounded-inner px-3 py-2 text-sm"
                          placeholder="Minutes"
                        />
                        <select
                          value={editTaskId}
                          onChange={(e) => setEditTaskId(e.target.value)}
                          className="bg-background border border-border rounded-inner px-3 py-2 text-sm"
                        >
                          <option value="">No task</option>
                          {tasks.map((task) => (
                            <option key={task.id} value={task.id}>{task.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="bg-background border border-border rounded-inner px-3 py-2 text-sm"
                          placeholder="Reflection"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 border border-border rounded-inner px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X size={13} /> Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          className="flex items-center gap-1.5 text-primary-foreground rounded-inner px-3 py-1.5 text-xs"
                          style={{ backgroundColor: skillColor }}
                        >
                          <Save size={13} /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-mono text-muted-foreground w-24 tabular-nums">
                          {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="text-sm font-mono tabular-nums">
                          {Math.floor(log.duration / 60) > 0 && `${Math.floor(log.duration / 60)}h `}
                          {log.duration % 60}m
                        </span>
                        {taskName && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium text-primary-foreground"
                            style={{ backgroundColor: skillColor }}
                          >
                            {taskName}
                          </span>
                        )}
                        {log.note && (
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{log.note}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => startEdit(log.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteLog(skill.id, log.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <LogModal
        skillId={skill.id}
        skillName={skill.name}
        skillIndex={skillIndex}
        open={logOpen}
        onClose={() => setLogOpen(false)}
      />
    </div>
  );
}
