import { useState } from "react";
import { useApp } from "@/lib/context";
import { getSkillColor } from "@/lib/skillColors";
import { Plus, X, CheckCircle2, Circle } from "lucide-react";

interface TaskManagerProps {
  skillId: string;
  skillIndex: number;
}

export function TaskManager({ skillId, skillIndex }: TaskManagerProps) {
  const { getSkill, addTask, toggleTask, deleteTask } = useApp();
  const [newName, setNewName] = useState("");

  const skill = getSkill(skillId);
  const tasks = skill?.tasks || [];
  const skillColor = getSkillColor(skillIndex);

  function handleAdd() {
    if (!newName.trim()) return;
    addTask(skillId, newName.trim());
    setNewName("");
  }

  if (tasks.length === 0 && !newName) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold mb-3">Active Tasks</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add your first task..."
            className="flex-1 bg-background border border-border rounded-inner px-3 py-2 text-sm placeholder:text-muted-foreground/50"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 rounded-inner text-sm font-medium text-primary-foreground"
            style={{ backgroundColor: skillColor }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6">
      <h2 className="font-display text-lg font-semibold mb-4">Active Tasks</h2>
      <div className="space-y-2 mb-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between py-2 px-3 rounded-inner hover:bg-muted/50 transition-colors group"
          >
            <button
              onClick={() => toggleTask(skillId, task.id)}
              className="flex items-center gap-3 text-sm"
            >
              {task.active ? (
                <Circle size={16} className="text-muted-foreground" />
              ) : (
                <CheckCircle2 size={16} style={{ color: skillColor }} />
              )}
              <span className={task.active ? "" : "line-through text-muted-foreground"}>
                {task.name}
              </span>
            </button>
            <button
              onClick={() => deleteTask(skillId, task.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New task..."
          className="flex-1 bg-background border border-border rounded-inner px-3 py-2 text-sm placeholder:text-muted-foreground/50"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 rounded-inner text-sm font-medium text-primary-foreground"
          style={{ backgroundColor: skillColor }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
