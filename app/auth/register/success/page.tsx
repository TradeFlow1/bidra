"use client";

import Link from "next/link";

export default function RegisterSuccessPage() {
  const shell = "bd-container py-6 pb-14";
  const card = "bd-card p-6 sm:p-8 max-w-[680px] mx-auto";

  return (
    <main className={shell}>
      <div className={card}>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0b1220]">Account created</h1>
        <p className="mt-2 text-sm text-black/60">
          Next: verify your email, then choose your first path. Buyers can browse, watch items, make offers, and keep handover details in Messages. Sellers can create a buyer-ready listing with clear photos, location, price, and safe handover notes.
        </p>

        <div className="mt-5 rounded-2xl border border-black/10 bg-neutral-50 p-4">
          <div className="text-sm font-extrabold text-[#0b1220]">First-run checklist</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-black/65">
            <li>Verify your email so account actions stay protected.</li>
            <li>Add your general location in Dashboard so buyers and sellers have useful pickup context.</li>
            <li>Use Messages to keep pickup, postage, payment expectations, and handover details on Bidra.</li>
          </ol>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/listings" className="bd-btn w-full text-center">
            Browse listings
          </Link>

          <Link href="/sell/new" className="bd-btn bd-btn-primary w-full text-center">
            Create listing
          </Link>

          <Link href="/dashboard" className="bd-btn w-full text-center">
            Complete setup
          </Link>
        </div>
      </div>
    </main>
  );
}
