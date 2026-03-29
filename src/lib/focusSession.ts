export interface FocusSessionState {
  selectedSkillId: string;
  accumulatedSeconds: number;
  startedAt: number | null;
  note: string;
  targetSeconds: number;
}

export const FOCUS_SESSION_STORAGE_KEY = "focus-session-state";

export const DEFAULT_FOCUS_SESSION_STATE: FocusSessionState = {
  selectedSkillId: "",
  accumulatedSeconds: 0,
  startedAt: null,
  note: "",
  targetSeconds: 25 * 60,
};

export function loadFocusState(): FocusSessionState {
  try {
    const raw = localStorage.getItem(FOCUS_SESSION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FOCUS_SESSION_STATE };
    const parsed = JSON.parse(raw) as Partial<FocusSessionState>;
    return {
      selectedSkillId: typeof parsed.selectedSkillId === "string" ? parsed.selectedSkillId : "",
      accumulatedSeconds: typeof parsed.accumulatedSeconds === "number" ? parsed.accumulatedSeconds : 0,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      note: typeof parsed.note === "string" ? parsed.note : "",
      targetSeconds: typeof parsed.targetSeconds === "number" && parsed.targetSeconds > 0
        ? Math.floor(parsed.targetSeconds)
        : DEFAULT_FOCUS_SESSION_STATE.targetSeconds,
    };
  } catch {
    return { ...DEFAULT_FOCUS_SESSION_STATE };
  }
}

export function saveFocusState(state: FocusSessionState) {
  localStorage.setItem(FOCUS_SESSION_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("focus-session-updated"));
}

export function getElapsedSeconds(state: FocusSessionState, nowMs = Date.now()): number {
  if (!state.startedAt) return Math.max(0, Math.floor(state.accumulatedSeconds));
  const runningDelta = Math.max(0, Math.floor((nowMs - state.startedAt) / 1000));
  return Math.max(0, Math.floor(state.accumulatedSeconds) + runningDelta);
}

export function getRemainingSeconds(state: FocusSessionState, nowMs = Date.now()): number {
  return Math.max(0, state.targetSeconds - getElapsedSeconds(state, nowMs));
}

export function isFocusSessionRunning(state: FocusSessionState): boolean {
  return state.startedAt !== null;
}
