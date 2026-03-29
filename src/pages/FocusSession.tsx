import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/context";
import { resolveSkillColor } from "@/lib/skillColors";
import { ArrowLeft, Pause, Play, RotateCcw, Save } from "lucide-react";
import {
  FocusSessionState,
  getElapsedSeconds,
  getRemainingSeconds,
  loadFocusState,
  saveFocusState,
} from "@/lib/focusSession";

function formatTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function FocusSession() {
  const navigate = useNavigate();
  const { data, addLog, getSkill, getSkillIndex } = useApp();

  const [state, setState] = useState<FocusSessionState>(loadFocusState);
  const [nowMs, setNowMs] = useState(Date.now());
  const [targetInput, setTargetInput] = useState(() => String(Math.max(1, Math.floor(loadFocusState().targetSeconds / 60))));

  const isRunning = state.startedAt !== null;

  useEffect(() => {
    saveFocusState(state);
  }, [state]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const remaining = getRemainingSeconds(state, Date.now());
    if (remaining > 0) return;
    setState((prev) => ({
      ...prev,
      startedAt: null,
      accumulatedSeconds: prev.targetSeconds,
    }));
  }, [isRunning, nowMs, state]);

  const selectedSkill = useMemo(
    () => data.skills.find((skill) => skill.id === state.selectedSkillId),
    [data.skills, state.selectedSkillId]
  );

  const selectedSkillColor = useMemo(() => {
    const idx = selectedSkill ? getSkillIndex(selectedSkill.id) : 0;
    return resolveSkillColor(selectedSkill, idx >= 0 ? idx : 0);
  }, [selectedSkill, getSkillIndex]);

  const elapsedSeconds = getElapsedSeconds(state, nowMs);
  const remainingSeconds = getRemainingSeconds(state, nowMs);
  const totalSeconds = Math.max(1, state.targetSeconds);
  const progress = Math.min(1, elapsedSeconds / totalSeconds);

  const ringSize = 280;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  function startTimer() {
    if (!state.selectedSkillId || isRunning) return;
    const now = Date.now();
    setNowMs(now);
    setState((prev) => ({ ...prev, startedAt: now }));
  }

  function pauseTimer() {
    if (!state.startedAt) return;
    const sessionSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
    setState((prev) => ({
      ...prev,
      startedAt: null,
      accumulatedSeconds: prev.accumulatedSeconds + sessionSeconds,
    }));
  }

  function resetTimer() {
    setState((prev) => ({ ...prev, startedAt: null, accumulatedSeconds: 0 }));
  }

  function logSession() {
    if (!state.selectedSkillId) return;
    const skill = getSkill(state.selectedSkillId);
    if (!skill) return;

    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
    if (minutes <= 0) return;

    addLog(skill.id, {
      date: new Date().toISOString().split("T")[0],
      duration: minutes,
      note: state.note.trim() || "Focus timer session",
    });

    const clearedState: FocusSessionState = {
      ...state,
      accumulatedSeconds: 0,
      startedAt: null,
      note: "",
    };
    setState(clearedState);
    saveFocusState(clearedState);
    navigate(`/skill/${skill.id}`);
  }

  function handleTargetChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly === "") {
      setTargetInput("");
      return;
    }
    const normalized = digitsOnly.replace(/^0+(?=\d)/, "");
    setTargetInput(normalized);
    const minutes = Math.max(1, parseInt(normalized, 10));
    setState((prev) => ({ ...prev, targetSeconds: minutes * 60 }));
  }

  function commitTargetInput() {
    if (targetInput.trim() === "") {
      setTargetInput("25");
      setState((prev) => ({ ...prev, targetSeconds: 25 * 60 }));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 md:px-12 pt-8 pb-4 flex items-center justify-between max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </header>

      <div className="px-6 md:px-12 max-w-4xl mx-auto py-10">
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Focus Session</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Choose a skill first. Sessions can only be logged when linked to a specific skill.
          </p>

          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">Skill</label>
            <select
              value={state.selectedSkillId}
              onChange={(e) => {
                const skillId = e.target.value;
                setState((prev) => ({ ...prev, selectedSkillId: skillId }));
              }}
              className="w-full bg-background border border-border rounded-inner px-4 py-3 text-sm"
            >
              <option value="">Select a skill</option>
              {data.skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.icon} {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mb-6 rounded-2xl border border-border bg-background/50 p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 20%, ${selectedSkillColor}, transparent 60%)` }} />
            <div className="relative flex flex-col items-center">
              <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="-rotate-90">
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    stroke={selectedSkillColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: "stroke-dashoffset 0.6s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {(!isRunning && elapsedSeconds === 0) ? (
                    <div className="flex items-end gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={targetInput}
                        onChange={(e) => handleTargetChange(e.target.value)}
                        onBlur={commitTargetInput}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-28 md:w-36 bg-transparent border-b-2 border-border text-center font-mono-app text-6xl md:text-7xl font-semibold tracking-tight tabular-nums outline-none"
                        style={{ borderColor: selectedSkillColor }}
                        aria-label="Set countdown minutes"
                      />
                      <span className="font-mono-app text-xl md:text-2xl text-muted-foreground mb-2">m</span>
                    </div>
                  ) : (
                    <p className="font-mono-app text-6xl md:text-7xl font-semibold tracking-tight tabular-nums">
                      {formatTimer(remainingSeconds)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">
                    {isRunning ? "In Focus" : elapsedSeconds > 0 ? "Paused" : "Set Duration"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">Reflection (optional)</label>
            <input
              type="text"
              value={state.note}
              onChange={(e) => setState((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="What did you work on?"
              className="w-full bg-background border border-border rounded-inner px-4 py-3 text-sm placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 text-primary-foreground rounded-inner px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: selectedSkillColor }}
              >
                <Pause size={14} /> Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                disabled={!state.selectedSkillId}
                className="flex items-center gap-2 text-primary-foreground rounded-inner px-4 py-2 text-sm font-medium disabled:opacity-40"
                style={{ backgroundColor: selectedSkillColor }}
              >
                <Play size={14} /> Start
              </button>
            )}

            <button
              onClick={resetTimer}
              className="flex items-center gap-2 border border-border rounded-inner px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={14} /> Reset
            </button>

            <button
              onClick={logSession}
              disabled={!state.selectedSkillId || elapsedSeconds <= 0}
              className="flex items-center gap-2 text-primary-foreground rounded-inner px-4 py-2 text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: selectedSkillColor }}
            >
              <Save size={14} /> Log Session
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Logged duration uses actual elapsed focus time. Timer stops automatically when logging.
          </p>
        </div>
      </div>
    </div>
  );
}
