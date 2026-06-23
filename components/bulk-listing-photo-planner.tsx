"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type DraftRow = {
  title: string;
  category: string;
  price: string;
  location: string;
  photoCount: number;
};

function parseRows(raw: string): DraftRow[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((line) => {
      const parts = line.split(",").map((part) => part.trim());
      const [title = "", category = "", price = "", location = "", photoCountRaw = "0"] = parts;
      const photoCount = Number(photoCountRaw.replace(/[^0-9]/g, ""));
      return {
        title: title.slice(0, 120),
        category: category.slice(0, 80),
        price: price.replace(/[^0-9.]/g, "").slice(0, 12),
        location: location.slice(0, 120),
        photoCount: Number.isFinite(photoCount) ? photoCount : 0,
      };
    });
}

function rowStatus(row: DraftRow) {
  const missing: string[] = [];
  if (row.title.length < 3) missing.push("title");
  if (!row.category) missing.push("category");
  if (!row.price || Number(row.price) <= 0) missing.push("price");
  if (!row.location) missing.push("location");
  if (row.photoCount < 1) missing.push("photo");
  if (row.photoCount > 10) missing.push("max 10 photos");
  return missing;
}

export default function BulkListingPhotoPlanner() {
  const [raw, setRaw] = useState("Dining table, Home & Living, 120, 4000 Brisbane QLD, 6\niPhone 13, Electronics, 450, 2000 Sydney NSW, 8");
  const rows = useMemo(() => parseRows(raw), [raw]);
  const readyRows = rows.filter((row) => rowStatus(row).length === 0);
  const totalPhotos = rows.reduce((sum, row) => sum + Math.max(0, Math.min(10, row.photoCount)), 0);

  return (
    <section className="rounded-[32px] border border-[#D8E6F8] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-7">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4F46E5]">Bulk listing prep</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-[#07152E] sm:text-3xl">Plan many listings before uploading</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#526173]">Paste one draft per line: title, category, price, location, photo count. Use this to prepare batches, then create each listing with clear photos and handover details.</p>
        </div>
        <Link href="/sell/new" className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#4F46E5] px-5 text-sm font-black text-white">Create listing</Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <label className="text-sm font-black text-[#07152E]" htmlFor="bulk-listing-drafts">Draft rows</label>
          <textarea
            id="bulk-listing-drafts"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            className="mt-2 min-h-48 w-full rounded-2xl border border-[#CBD5E1] px-4 py-3 text-sm font-semibold leading-6 text-[#07152E]"
            placeholder="Title, Category, Price, Location, Photo count"
          />
          <p className="mt-2 text-xs font-semibold leading-5 text-[#64748B]">This planner is browser-only. It does not publish listings or upload files until you create each listing.</p>
        </div>

        <aside className="rounded-[28px] border border-[#D8E6F8] bg-[#F8FAFF] p-4">
          <h3 className="text-lg font-black text-[#07152E]">Batch readiness</h3>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white p-3"><div className="text-2xl font-black text-[#07152E]">{rows.length}</div><div className="text-[11px] font-bold text-[#64748B]">Drafts</div></div>
            <div className="rounded-2xl bg-white p-3"><div className="text-2xl font-black text-[#07152E]">{readyRows.length}</div><div className="text-[11px] font-bold text-[#64748B]">Ready</div></div>
            <div className="rounded-2xl bg-white p-3"><div className="text-2xl font-black text-[#07152E]">{totalPhotos}</div><div className="text-[11px] font-bold text-[#64748B]">Photos</div></div>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-[#526173]"><li>Keep each listing under 10 photos.</li><li>Use the first photo as the hero image.</li><li>Show faults, scale and included accessories.</li><li>Confirm pickup, delivery or postage in Bidra Messages.</li></ul>
        </aside>
      </div>

      {rows.length ? (
        <div className="mt-5 overflow-hidden rounded-[24px] border border-[#D8E6F8]">
          <div className="grid grid-cols-[1.2fr_0.9fr_0.5fr_0.9fr_0.7fr] bg-[#EEF2FF] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#3730A3]"><span>Title</span><span>Category</span><span>Price</span><span>Location</span><span>Status</span></div>
          {rows.map((row, index) => {
            const missing = rowStatus(row);
            return (
              <div key={`${row.title}-${index}`} className="grid grid-cols-[1.2fr_0.9fr_0.5fr_0.9fr_0.7fr] border-t border-[#D8E6F8] px-3 py-2 text-sm font-semibold text-[#334155]">
                <span className="truncate pr-2">{row.title || "Untitled"}</span><span className="truncate pr-2">{row.category || "-"}</span><span>{row.price ? `$${row.price}` : "-"}</span><span className="truncate pr-2">{row.location || "-"}</span><span className={missing.length ? "text-amber-700" : "text-emerald-700"}>{missing.length ? missing.join(", ") : "Ready"}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
