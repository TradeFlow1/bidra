"use client";

import { useState } from "react";

type PresetKey = "todayEvening" | "tomorrowMorning" | "tomorrowAfternoon" | "tomorrowEvening";

type SlotValues = {
  date: string;
  time: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateLocal(date: Date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate())
  ].join("-");
}

function formatTimeLocal(date: Date) {
  return [pad2(date.getHours()), pad2(date.getMinutes())].join(":");
}

function buildSlotValues(date: Date): SlotValues {
  return {
    date: formatDateLocal(date),
    time: formatTimeLocal(date)
  };
}

function createDate(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();
  date.setSeconds(0, 0);
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function getPresetSlots(preset: PresetKey): SlotValues[] {
  if (preset === "todayEvening") {
    return [
      buildSlotValues(createDate(0, 18, 0)),
      buildSlotValues(createDate(0, 19, 30)),
      buildSlotValues(createDate(0, 21, 0))
    ];
  }

  if (preset === "tomorrowMorning") {
    return [
      buildSlotValues(createDate(1, 9, 0)),
      buildSlotValues(createDate(1, 10, 30)),
      buildSlotValues(createDate(1, 12, 0))
    ];
  }

  if (preset === "tomorrowAfternoon") {
    return [
      buildSlotValues(createDate(1, 13, 0)),
      buildSlotValues(createDate(1, 14, 30)),
      buildSlotValues(createDate(1, 16, 0))
    ];
  }

  return [
    buildSlotValues(createDate(1, 18, 0)),
    buildSlotValues(createDate(1, 19, 30)),
    buildSlotValues(createDate(1, 21, 0))
  ];
}

export default function SellerPickupOptionsForm({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotValues[]>(function () {
    return getPresetSlots("tomorrowEvening");
  });

  function updateSlot(index: number, field: "date" | "time", value: string) {
    setSlots(function (current) {
      const next = current.slice();
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function applyPreset(preset: PresetKey) {
    setError(null);
    setSlots(getPresetSlots(preset));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const raw = slots.map(function (slot) {
        return [slot.date.trim(), slot.time.trim()].join("T");
      });

      const options = raw
        .filter(function (v) { return v !== "T"; })
        .map(function (v) { return new Date(v).toISOString(); });

      if (options.length !== 3) {
        throw new Error("Please provide all 3 pickup options.");
      }

      const uniqueOptions = Array.from(new Set(options));
      if (uniqueOptions.length !== 3) {
        throw new Error("Pickup options must be different.");
      }

      const times = uniqueOptions.map(function (v) { return new Date(v).getTime(); });
      const now = Date.now();

      if (times.some(function (t) { return !Number.isFinite(t) || t <= now; })) {
        throw new Error("Pickup options must be in the future.");
      }

      const sorted = times.slice().sort(function (a, b) { return a - b; });
      for (let j = 1; j < sorted.length; j += 1) {
        if ((sorted[j] - sorted[j - 1]) < (60 * 60 * 1000)) {
          throw new Error("Leave at least 1 hour between pickup options.");
        }
      }

      const res = await fetch(`/api/orders/${orderId}/pickup/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: options })
      });

      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Unable to update pickup options.");
      }

      window.location.reload();
    } catch (err: any) {
      setError(err?.message || "Unable to update pickup options.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-black/10 bg-white/5 p-4">
        <div className="text-sm font-semibold bd-ink">Quick fill</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="bd-btn bd-btn-ghost" onClick={function () { applyPreset("todayEvening"); }}>Today evening</button>
          <button type="button" className="bd-btn bd-btn-ghost" onClick={function () { applyPreset("tomorrowMorning"); }}>Tomorrow morning</button>
          <button type="button" className="bd-btn bd-btn-ghost" onClick={function () { applyPreset("tomorrowAfternoon"); }}>Tomorrow afternoon</button>
          <button type="button" className="bd-btn bd-btn-ghost" onClick={function () { applyPreset("tomorrowEvening"); }}>Tomorrow evening</button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        {slots.map(function (slot, index) {
          return (
            <div key={index} className="rounded-2xl border border-black/10 bg-white/5 p-4">
              <div className="text-sm font-semibold bd-ink">Pickup option {index + 1}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide bd-ink2">Date</span>
                  <input
                    type="date"
                    value={slot.date}
                    onChange={function (e) { updateSlot(index, "date", e.currentTarget.value); }}
                    required
                    className="bd-input"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-wide bd-ink2">Time</span>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={function (e) { updateSlot(index, "time", e.currentTarget.value); }}
                    required
                    className="bd-input"
                  />
                </label>
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl border border-black/10 bg-white/5 px-4 py-3 text-sm bd-ink2">
          Add 3 different future pickup times. Leave at least 1 hour between each option so the buyer can choose one quickly.
        </div>

        <button type="submit" className="bd-btn bd-btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Post pickup options"}
        </button>
      </form>

      {error ? (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      ) : null}
    </div>
  );
}