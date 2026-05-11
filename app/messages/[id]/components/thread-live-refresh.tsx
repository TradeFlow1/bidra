"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 3500;

export default function ThreadLiveRefresh() {
  const router = useRouter();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;

    function refreshNow() {
      if (stopped) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      router.refresh();
    }

    function start() {
      if (timerRef.current !== null) return;

      timerRef.current = window.setInterval(function () {
        refreshNow();
      }, REFRESH_MS);
    }

    function stop() {
      if (timerRef.current === null) return;
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshNow();
        start();
      } else {
        stop();
      }
    }

    function onSent() {
      refreshNow();
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

  return null;
}
