// Centralized skill color mapping using CSS custom properties
const SKILL_COLOR_VARS = [
  "var(--skill-1)",
  "var(--skill-2)",
  "var(--skill-3)",
  "var(--skill-4)",
  "var(--skill-5)",
  "var(--skill-6)",
];

export function getSkillColor(index: number): string {
  return `hsl(${SKILL_COLOR_VARS[index % SKILL_COLOR_VARS.length]})`;
}

export function getSkillColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getSkillColor(i));
}
