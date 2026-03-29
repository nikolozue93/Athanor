import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadFocusState, getElapsedSeconds, isFocusSessionRunning } from "@/lib/focusSession";

function formatShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function SessionIndicator() {
  const [nowMs, setNowMs] = useState(Date.now());
  const [state, setState] = useState(loadFocusState);

  useEffect(() => {
    const syncState = () => {
      setState(loadFocusState());
      setNowMs(Date.now());
    };

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    window.addEventListener("storage", syncState);
    window.addEventListener("focus-session-updated", syncState);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", syncState);
      window.removeEventListener("focus-session-updated", syncState);
    };
  }, []);

  const running = isFocusSessionRunning(state);
  const elapsed = useMemo(() => getElapsedSeconds(state, nowMs), [state, nowMs]);

  if (!running) return null;

  return (
    <Link
      to="/focus"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs text-foreground hover:bg-accent/60 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      Session running {formatShort(elapsed)}
    </Link>
  );
}
