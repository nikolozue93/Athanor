import { Skill } from "@/lib/types";

// Centralized skill color mapping using CSS custom properties
const SKILL_COLOR_VARS = [
  "var(--skill-1)",
  "var(--skill-2)",
  "var(--skill-3)",
  "var(--skill-4)",
  "var(--skill-5)",
  "var(--skill-6)",
];

export const SKILL_COLOR_OPTIONS: string[] = [
  ...SKILL_COLOR_VARS.map((value) => `hsl(${value})`),
  "#ef4444",
  "#f97316",
  "#14b8a6",
  "#0ea5e9",
  "#8b5cf6",
  "#ec4899",
];

export function getSkillColor(index: number): string {
  return `hsl(${SKILL_COLOR_VARS[index % SKILL_COLOR_VARS.length]})`;
}

export function resolveSkillColor(skill: Skill | undefined, index: number): string {
  if (skill?.color) return skill.color;
  return getSkillColor(index);
}

export function getSkillColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getSkillColor(i));
}
