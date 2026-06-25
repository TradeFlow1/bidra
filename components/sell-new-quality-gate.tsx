"use client";

import { useEffect, useMemo, useState } from "react";

function text(value: unknown) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function hasConditionSignal(value: string) {
  return /condition|new|used|like new|fault|faults|mark|marks|scratch|scratches|wear|working|works|damage|damaged/i.test(value);
}

function hasHandoverSignal(value: string) {
  return /pickup|pick up|postage|post|delivery|deliver|handover|collect|collection/i.test(value);
}

function isValidAuLocation(value: string) {
  const match = text(value).match(/^(\d{4})\s+(.+?),\s*([A-Za-z]{2,3})$/);
  if (!match) return false;
  return new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]).has(match[3].toUpperCase());
}

export default function SellNewQualityGate() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const descriptionField = document.getElementById("field-description") as HTMLTextAreaElement | null;
    const locationField = document.getElementById("field-location") as HTMLInputElement | null;
    const form = descriptionField?.closest("form") as HTMLFormElement | null;

    function sync() {
      setDescription(descriptionField?.value || "");
      setLocation(locationField?.value || "");
    }

    function onSubmit(event: Event) {
      const desc = text(descriptionField?.value || "");
      const loc = text(locationField?.value || "");
      const blocked = desc.length < 40 || !hasConditionSignal(desc) || !hasHandoverSignal(desc) || !isValidAuLocation(loc);
      if (blocked) {
        event.preventDefault();
        event.stopPropagation();
        sync();
        descriptionField?.focus();
      }
    }

    sync();
    descriptionField?.addEventListener("input", sync);
    locationField?.addEventListener("input", sync);
    form?.addEventListener("submit", onSubmit, true);

    return () => {
      descriptionField?.removeEventListener("input", sync);
      locationField?.removeEventListener("input", sync);
      form?.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  const checks = useMemo(() => {
    const desc = text(description);
    const loc = text(location);
    return [
      { label: "Description has at least 40 useful characters", ok: desc.length >= 40 },
      { label: "Description mentions condition, faults, marks, or working state", ok: hasConditionSignal(desc) },
      { label: "Description includes pickup, postage, delivery, or handover details", ok: hasHandoverSignal(desc) },
      { label: "Location uses postcode + suburb + state, e.g. 4000 Brisbane, QLD", ok: isValidAuLocation(loc) },
    ];
  }, [description, location]);

  const ready = checks.every((item) => item.ok);

  return (
    <section className={ready ? "rounded-[24px] border border-emerald-200 bg-emerald-50 p-4" : "rounded-[24px] border border-amber-200 bg-amber-50 p-4"}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-black text-[#07152E]">Listing quality gate</div>
        <div className={ready ? "text-xs font-black text-emerald-800" : "text-xs font-black text-amber-900"}>{ready ? "Ready" : "Needs detail"}</div>
      </div>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#526173]">This matches the server quality rules before publish so sellers can fix details before upload.</p>
      <ul className="mt-3 grid gap-2 text-xs font-bold leading-5 text-[#334155]">
        {checks.map((item) => (
          <li key={item.label} className="flex gap-2"><span aria-hidden="true">{item.ok ? "✓" : "•"}</span><span>{item.label}</span></li>
        ))}
      </ul>
    </section>
  );
}
