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

function shouldSendPing(nowMs: number, minIntervalMs: number): boolean {
  try {
    const k = "bidra_last_ping_ms";
    const raw = window.localStorage.getItem(k);
    const last = raw ? Number(raw) : 0;
    if (Number.isFinite(last) && last > 0 && nowMs - last < minIntervalMs) return false;

    // reserve the slot for this tab
    window.localStorage.setItem(k, String(nowMs));
    return true;
  } catch {
    // If storage is blocked, fall back to sending (best effort).
    return true;
  }
}

export default function ActivityPinger() {
  const sessionIdRef = useRef<string | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastActiveInputRef = useRef<number>(0);
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

    const intervalMs = 30000;     // tick cadence
    const idleAfterMs = 60000;    // idle threshold
    const minPingEveryMs = 60000; // cross-tab throttle

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

      // Cross-tab throttle: only one tab should send a ping per minute
      if (!shouldSendPing(now, minPingEveryMs)) return;

      // Tiny jitter to avoid herd effects when many clients tick at once
      const jitter = Math.floor(Math.random() * 1200);
      if (jitter > 0) {
        await new Promise((r) => window.setTimeout(r, jitter));
      }

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

