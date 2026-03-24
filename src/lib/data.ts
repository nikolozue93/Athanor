import { AppData, Skill, TimeLog } from "./types";

const STORAGE_KEY = "monolith-data";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const data = getInitialData();
  saveData(data);
  return data;
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTotalHours(skill: Skill): number {
  return skill.logs.reduce((sum, l) => sum + l.duration, 0) / 60;
}

export function getProgress(skill: Skill): number {
  return Math.min((getTotalHours(skill) / 10000) * 100, 100);
}

export function getAverageDailyHours(skill: Skill): number {
  if (skill.logs.length === 0) return 0;
  const dates = skill.logs.map((l) => new Date(l.date).getTime());
  const earliest = Math.min(...dates);
  const days = Math.max(1, (Date.now() - earliest) / (1000 * 60 * 60 * 24));
  return getTotalHours(skill) / days;
}

export function getEstimatedCompletionDate(skill: Skill): Date | null {
  const avg = getAverageDailyHours(skill);
  if (avg <= 0) return null;
  const remaining = 10000 - getTotalHours(skill);
  if (remaining <= 0) return new Date();
  const daysRemaining = remaining / avg;
  const date = new Date();
  date.setDate(date.getDate() + daysRemaining);
  return date;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function getInitialData(): AppData {
  const now = new Date();
  const daysAgo = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date.toISOString().split("T")[0];
  };

  const makeLogs = (count: number, avgMin: number): TimeLog[] => {
    const logs: TimeLog[] = [];
    for (let i = 0; i < count; i++) {
      const day = Math.floor(Math.random() * 365);
      logs.push({
        id: generateId(),
        date: daysAgo(day),
        duration: Math.round(avgMin + (Math.random() - 0.5) * avgMin * 0.6),
        note: i % 3 === 0 ? "Focused session" : i % 3 === 1 ? "Reviewed fundamentals" : undefined,
      });
    }
    return logs.sort((a, b) => b.date.localeCompare(a.date));
  };

  return {
    skills: [
      { id: generateId(), name: "Piano", icon: "🎹", logs: makeLogs(180, 55), tasks: [], createdAt: daysAgo(365) },
      { id: generateId(), name: "Drawing", icon: "✏️", logs: makeLogs(120, 45), tasks: [], createdAt: daysAgo(300) },
      { id: generateId(), name: "Programming", icon: "💻", logs: makeLogs(250, 70), tasks: [], createdAt: daysAgo(365) },
      { id: generateId(), name: "Writing", icon: "📝", logs: makeLogs(80, 40), tasks: [], createdAt: daysAgo(200) },
    ],
  };
}

export function getHeatmapData(skills: Skill[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const skill of skills) {
    for (const log of skill.logs) {
      const date = log.date;
      map.set(date, (map.get(date) || 0) + log.duration);
    }
  }
  return map;
}
