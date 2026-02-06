"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";

type SuggestItem = {
  name: string;
  postcode: number;
  state?: { abbreviation?: string | null } | null;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LocationSuggest(props: {
  query: string;
  onPick: (x: { suburb: string; postcode: string; state: string }) => void;
}) {
  const qRaw = String(props.query || "");
  const q = qRaw.trim();

  const [items, setItems] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const cacheRef = useRef<Record<string, SuggestItem[]>>({});
  const abortRef = useRef<AbortController | null>(null);

  const canQuery = useMemo(() => {
    // avoid hammering: require at least 3 chars OR a 4-digit postcode
    const digits = q.replace(/\D/g, "");
    if (digits.length === 4) return true;
    return q.length >= 3;
  }, [q]);

  useEffect(() => {
    setErr("");
    if (!canQuery) {
      setItems([]);
      setLoading(false);
      return;
    }

    const key = q.toLowerCase();
    const cached = cacheRef.current[key];
    if (cached) {
      setItems(cached);
      setLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        // Public AU suburb/postcode lookup
        const url = `https://v0.postcodeapi.com.au/suburbs.json?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error("Lookup failed");
        const data = (await res.json()) as SuggestItem[];

        const top = Array.isArray(data) ? data.slice(0, 8) : [];
        cacheRef.current[key] = top;
        setItems(top);
        setLoading(false);
      } catch (e: any) {
        if (String(e?.name || "") === "AbortError") return;
        setLoading(false);
        setItems([]);
        setErr("Couldn’t load suggestions. You can still type manually.");
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, canQuery]);

  if (!canQuery) return null;

  return (
    <div className="mt-2 rounded-2xl border bd-bd bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold bd-ink">Suggestions</div>
        {loading ? <div className="text-xs bd-ink2">Searching…</div> : null}
      </div>

      {err ? <div className="mt-2 text-xs text-red-700">{err}</div> : null}

      {items.length ? (
        <div className="mt-2 flex flex-col gap-2">
          {items.map((it, idx) => {
            const suburb = String(it?.name || "").trim();
            const postcode = String(it?.postcode ?? "").trim();
            const st = String(it?.state?.abbreviation || "").trim().toUpperCase();
            // (removed unused label)

            return (
              <button
                key={`${suburb}-${postcode}-${st}-${idx}`}
                type="button"
                className={cx(
                  "w-full rounded-xl border bd-bd px-3 py-2 text-left text-sm",
                  "hover:bg-black/5"
                )}
                onClick={() => props.onPick({ suburb, postcode, state: st })}
              >
                <span className="font-semibold bd-ink">{suburb}</span>{" "}
                <span className="bd-ink2">{postcode}{st ? `, ${st}` : ""}</span>
              </button>
            );
          })}
        </div>
      ) : !loading ? (
        <div className="mt-2 text-xs bd-ink2">No matches yet — keep typing.</div>
      ) : null}

      <div className="mt-2 text-[11px] bd-ink2 opacity-70">
        Tip: click a suggestion to auto-fill suburb, postcode, and state.
      </div>
    </div>
  );
}

