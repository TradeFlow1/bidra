"use client";

import { useEffect, useRef } from "react";

function getOrCreateSessionId(): string {
  try {
    const key = "bidra_session_id";
    const existing = window.localStorage.getItem(key);
    if (existing && existing.length >= 8) return existing;

    const rand = Math.random().toString(36).slice(2);
    const id = `s_${Date.now().toString(36)}_${rand}`;
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    const rand = Math.random().toString(36).slice(2);
    return `s_${Date.now().toString(36)}_${rand}`;
  }
}

export default function ActivityPinger() {
  const sessionIdRef = useRef<string | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const lastActiveInputRef = useRef<number>(Date.now());
  const visibleRef = useRef<boolean>(true);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };

    const markActive = () => {
      lastActiveInputRef.current = Date.now();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("mousemove", markActive, { passive: true });
    window.addEventListener("keydown", markActive, { passive: true });
    window.addEventListener("scroll", markActive, { passive: true });
    window.addEventListener("touchstart", markActive, { passive: true });

    const intervalMs = 30000;
    const idleAfterMs = 60000;

    const timer = window.setInterval(async () => {
      const now = Date.now();
      const lastTick = lastTickRef.current;
      lastTickRef.current = now;

      const delta = Math.max(0, now - lastTick);

      const isVisible = visibleRef.current;
      const sinceInput = now - lastActiveInputRef.current;

      const isIdle = !isVisible || sinceInput >= idleAfterMs;

      const activeMsDelta = isIdle ? 0 : delta;
      const idleMsDelta = isIdle ? delta : 0;

      const sessionId = sessionIdRef.current;
      if (!sessionId) return;

      try {
        await fetch("/api/activity/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            userAgent: navigator.userAgent || undefined,
            activeMsDelta,
            idleMsDelta,
          }),
        });
      } catch {
        // silent
      }
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", markActive);
      window.removeEventListener("keydown", markActive);
      window.removeEventListener("scroll", markActive);
      window.removeEventListener("touchstart", markActive);
    };
  }, []);

  return null;
}
