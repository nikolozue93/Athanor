import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { X, Minus, Plus, ListTodo, PlusCircle } from "lucide-react";
import { getSkillColor } from "@/lib/skillColors";

interface LogModalProps {
  skillId: string;
  skillName: string;
  skillIndex: number;
  open: boolean;
  onClose: () => void;
}

export function LogModal({ skillId, skillName, skillIndex, open, onClose }: LogModalProps) {
  const { addLog, getSkill, addTask } = useApp();
  const [minutes, setMinutes] = useState(30);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);
  const [newTaskName, setNewTaskName] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");

  const skill = getSkill(skillId);
  const tasks = skill?.tasks?.filter((t) => t.active) || [];
  const skillColor = getSkillColor(skillIndex);

  const step = 5;

  function handleSubmit() {
    if (minutes <= 0) return;
    addLog(skillId, { date, duration: minutes, note: note.trim() || undefined, taskId: selectedTaskId });
    setMinutes(30);
    setNote("");
    setSelectedTaskId(undefined);
    onClose();
  }

  function handleAddTask() {
    if (!newTaskName.trim()) return;
    addTask(skillId, newTaskName.trim());
    setNewTaskName("");
    setShowTaskInput(false);
  }

  function handleTimeClick() {
    setIsEditingTime(true);
    setTimeInput(String(minutes));
  }

  function handleTimeBlur() {
    setIsEditingTime(false);
    const parsed = parseInt(timeInput, 10);
    if (!isNaN(parsed) && parsed > 0) setMinutes(parsed);
  }

  function handleTimeKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  const displayHours = Math.floor(minutes / 60);
  const displayMins = minutes % 60;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full md:max-w-md"
          >
            <div className="bg-card border border-border rounded-t-3xl md:rounded-3xl p-8 max-h-[90vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-xl font-semibold">Log time — {skillName}</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                  <X size={18} />
                </button>
              </div>

              {/* Duration stepper */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <button
                  onClick={() => setMinutes(Math.max(step, minutes - step))}
                  className="w-12 h-12 rounded-inner border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center min-w-[120px]">
                  {isEditingTime ? (
                    <input
                      type="number"
                      value={timeInput}
                      onChange={(e) => setTimeInput(e.target.value)}
                      onBlur={handleTimeBlur}
                      onKeyDown={handleTimeKeyDown}
                      autoFocus
                      className="font-display text-5xl font-semibold tracking-tighter tabular-nums text-center w-full bg-transparent outline-none border-b-2 border-primary"
                      style={{ borderColor: skillColor }}
                      min={1}
                    />
                  ) : (
                    <p
                      onClick={handleTimeClick}
                      className="font-display text-5xl font-semibold tracking-tighter tabular-nums cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {displayHours > 0 && <span>{displayHours}h </span>}
                      <span>{displayMins}m</span>
                    </p>
                  )}
                  {isEditingTime && (
                    <p className="text-xs text-muted-foreground mt-1">minutes</p>
                  )}
                </div>
                <button
                  onClick={() => setMinutes(minutes + step)}
                  className="w-12 h-12 rounded-inner border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Task selector */}
              {tasks.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm text-muted-foreground block mb-2 flex items-center gap-1.5">
                    <ListTodo size={14} /> Task
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTaskId(undefined)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        !selectedTaskId
                          ? "border-transparent text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={!selectedTaskId ? { backgroundColor: skillColor } : {}}
                    >
                      None
                    </button>
                    {tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedTaskId === task.id
                            ? "border-transparent text-primary-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                        style={selectedTaskId === task.id ? { backgroundColor: skillColor } : {}}
                      >
                        {task.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add task inline */}
              <div className="mb-6">
                {showTaskInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                      placeholder="Task name..."
                      autoFocus
                      className="flex-1 bg-background border border-border rounded-inner px-3 py-2 text-sm placeholder:text-muted-foreground/50"
                    />
                    <button
                      onClick={handleAddTask}
                      className="px-3 py-2 rounded-inner text-sm font-medium text-primary-foreground"
                      style={{ backgroundColor: skillColor }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowTaskInput(false); setNewTaskName(""); }}
                      className="px-2 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTaskInput(true)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle size={14} /> Add a task
                  </button>
                )}
              </div>

              {/* Date */}
              <div className="mb-6">
                <label className="text-sm text-muted-foreground block mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background border border-border rounded-inner px-4 py-3 text-sm font-mono"
                />
              </div>

              {/* Note */}
              <div className="mb-8">
                <label className="text-sm text-muted-foreground block mb-2">Reflection (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What did you work on?"
                  className="w-full bg-background border border-border rounded-inner px-4 py-3 text-sm placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full text-primary-foreground rounded-inner py-3.5 font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: skillColor }}
              >
                Log practice
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
