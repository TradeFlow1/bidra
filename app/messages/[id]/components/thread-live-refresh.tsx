"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 3500;

export default function ThreadLiveRefresh() {
  const router = useRouter();
  const [status, setStatus] = useState("Live updates on");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;

    function refreshNow(reason: string) {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

      setStatus(reason);
      router.refresh();

      window.setTimeout(function () {
        if (!stopped) setStatus("Live updates on");
      }, 900);
    }

    function start() {
      if (timerRef.current !== null) return;

      timerRef.current = window.setInterval(function () {
        refreshNow("Checking for replies");
      }, REFRESH_MS);
    }

    function stop() {
      if (timerRef.current === null) return;
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshNow("Back online");
        start();
      } else {
        stop();
      }
    }

    function onSent() {
      refreshNow("Message sent");
    }

    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      start();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("bidra:message-sent", onSent);

    return function () {
      stopped = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("bidra:message-sent", onSent);
    };
  }, [router]);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-sm">
      {status}
    </div>
  );
}
