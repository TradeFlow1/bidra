'use client';

import { useState } from "react";

type DistanceSliderProps = {
  defaultValue: string;
};

export default function DistanceSlider({ defaultValue }: DistanceSliderProps) {
  const initial = Number(defaultValue || "0");
  const [value, setValue] = useState(Number.isFinite(initial) ? initial : 0);
  const label = value <= 0 ? "Any distance" : "Within " + value + " km";

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-center justify-between text-xs font-black text-[#0F172A]">
        <span>Distance</span>
        <span>{label}</span>
      </div>
      <input
        name="radius"
        type="range"
        min="0"
        max="500"
        step="5"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-4 w-full accent-[#4F46E5]"
      />
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-[#64748B]">
        <span>Any</span>
        <span>500 km</span>
      </div>
    </div>
  );
}

