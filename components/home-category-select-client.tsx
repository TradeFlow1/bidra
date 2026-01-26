"use client";

import { useRouter } from "next/navigation";
import { CATEGORY_GROUPS, joinCategory } from "@/lib/categories";

export default function HomeCategorySelectClient() {
  const router = useRouter();

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <label className="block text-xs font-medium text-slate-600">
        Choose a category
      </label>

      <select
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
        defaultValue=""
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          router.push(`/listings?category=${encodeURIComponent(v)}`);
        }}
      >
        <option value="">Select a category…</option>

        {CATEGORY_GROUPS.map((g) => (
          <optgroup key={g.parent} label={g.parent}>
            <option value={g.parent}>{g.parent}</option>
            {g.children.map((c) => (
              <option key={`${g.parent}:${c}`} value={joinCategory(g.parent, c)}>
                {c}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
