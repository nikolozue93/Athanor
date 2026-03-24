export interface TimeLog {
  id: string;
  date: string; // ISO date string
  duration: number; // minutes
  note?: string;
  taskId?: string;
}

export interface Task {
  id: string;
  name: string;
  active: boolean;
}

export interface SkillTiers {
  tiers: { hours: number; label: string }[];
}

export interface Skill {
  id: string;
  name: string;
  icon: string; // emoji
  logs: TimeLog[];
  tasks: Task[];
  customTiers?: SkillTiers;
  createdAt: string;
}

export interface AppData {
  skills: Skill[];
}
