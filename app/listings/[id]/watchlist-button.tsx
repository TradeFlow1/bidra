"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  listingId: string;
  authed: boolean;
  loginHref: string;
};

export default function WatchlistButton(props: Props) {
  const router = useRouter();
  const [watched, setWatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const label = useMemo(function () {
    if (!props.authed) return "Log in to watch";
    if (loading) return watched ? "Removing..." : "Saving...";
    return watched ? "Watching" : "Save listing";
  }, [props.authed, loading, watched]);

  useEffect(function () {
    let alive = true;

    if (!props.authed) {
      setReady(true);
      setWatched(false);
      setError("");
      return function () {
        alive = false;
      };
    }

    async function loadStatus() {
      try {
        setError("");
        const res = await fetch("/api/watchlist/status?listingId=" + encodeURIComponent(props.listingId), {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const data = await res.json().catch(function () { return {}; });
        if (!alive) return;

        if (!res.ok) {
          setError(typeof data?.error === "string" ? data.error : "Unable to load watch status.");
          setWatched(false);
          setReady(true);
          return;
        }

        setWatched(Boolean(data?.watched));
        setReady(true);
      } catch (e) {
        if (!alive) return;
        setError("Unable to load watch status.");
        setWatched(false);
        setReady(true);
      }
    }

    loadStatus();

    return function () {
      alive = false;
    };
  }, [props.authed, props.listingId]);

  async function onClick() {
    if (!props.authed) {
      router.push(props.loginHref);
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/watchlist/toggle", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: props.listingId }),
      });

      const data = await res.json().catch(function () { return {}; });

      if (!res.ok) {
        if (res.status === 401) {
          router.push(props.loginHref);
          return;
        }

        setError(typeof data?.error === "string" ? data.error : "Unable to update watchlist.");
        return;
      }

      setWatched(Boolean(data?.watched));
    } catch (e) {
      setError("Unable to update watchlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading || !ready}
        className={watched
          ? "bd-btn bd-btn-ghost w-full text-center !border-amber-300 !bg-amber-50 !text-amber-950 hover:!bg-amber-100 disabled:opacity-60"
          : "bd-btn bd-btn-ghost w-full text-center disabled:opacity-60"}
      >
        {ready ? label : "Loading..."}
      </button>

      {error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : null}
    </div>
  );
}