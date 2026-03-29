import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AppData, Skill, TimeLog, Task } from "@/lib/types";
import { loadData, saveData, generateId } from "@/lib/data";

interface AppContextType {
  data: AppData;
  addSkill: (name: string, icon: string, color?: string) => void;
  deleteSkill: (id: string) => void;
  addLog: (skillId: string, log: Omit<TimeLog, "id">) => void;
  updateLog: (skillId: string, logId: string, updates: Omit<TimeLog, "id">) => void;
  deleteLog: (skillId: string, logId: string) => void;
  getSkill: (id: string) => Skill | undefined;
  addTask: (skillId: string, name: string) => void;
  toggleTask: (skillId: string, taskId: string) => void;
  deleteTask: (skillId: string, taskId: string) => void;
  getSkillIndex: (skillId: string) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addSkill = useCallback((name: string, icon: string, color?: string) => {
    setData((prev) => ({
      skills: [
        ...prev.skills,
        { id: generateId(), name, icon, color, logs: [], tasks: [], createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const deleteSkill = useCallback((id: string) => {
    setData((prev) => ({ skills: prev.skills.filter((s) => s.id !== id) }));
  }, []);

  const addLog = useCallback((skillId: string, log: Omit<TimeLog, "id">) => {
    setData((prev) => ({
      skills: prev.skills.map((s) =>
        s.id === skillId
          ? { ...s, logs: [{ ...log, id: generateId() }, ...s.logs].sort((a, b) => b.date.localeCompare(a.date)) }
          : s
      ),
    }));
  }, []);

  const updateLog = useCallback((skillId: string, logId: string, updates: Omit<TimeLog, "id">) => {
    setData((prev) => ({
      skills: prev.skills.map((s) => {
        if (s.id !== skillId) return s;
        const updatedLogs = s.logs
          .map((l) => (l.id === logId ? { ...updates, id: logId } : l))
          .sort((a, b) => b.date.localeCompare(a.date));
        return { ...s, logs: updatedLogs };
      }),
    }));
  }, []);

  const deleteLog = useCallback((skillId: string, logId: string) => {
    setData((prev) => ({
      skills: prev.skills.map((s) =>
        s.id === skillId ? { ...s, logs: s.logs.filter((l) => l.id !== logId) } : s
      ),
    }));
  }, []);

  const getSkill = useCallback(
    (id: string) => data.skills.find((s) => s.id === id),
    [data]
  );

  const getSkillIndex = useCallback(
    (skillId: string) => data.skills.findIndex((s) => s.id === skillId),
    [data]
  );

  const addTask = useCallback((skillId: string, name: string) => {
    setData((prev) => ({
      skills: prev.skills.map((s) =>
        s.id === skillId
          ? { ...s, tasks: [...(s.tasks || []), { id: generateId(), name, active: true }] }
          : s
      ),
    }));
  }, []);

  const toggleTask = useCallback((skillId: string, taskId: string) => {
    setData((prev) => ({
      skills: prev.skills.map((s) =>
        s.id === skillId
          ? { ...s, tasks: (s.tasks || []).map((t) => t.id === taskId ? { ...t, active: !t.active } : t) }
          : s
      ),
    }));
  }, []);

  const deleteTask = useCallback((skillId: string, taskId: string) => {
    setData((prev) => ({
      skills: prev.skills.map((s) =>
        s.id === skillId
          ? { ...s, tasks: (s.tasks || []).filter((t) => t.id !== taskId) }
          : s
      ),
    }));
  }, []);

  return (
    <AppContext.Provider value={{ data, addSkill, deleteSkill, addLog, updateLog, deleteLog, getSkill, addTask, toggleTask, deleteTask, getSkillIndex }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
