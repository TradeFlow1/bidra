"use client";

import Link from "next/link";

export default function RegisterSuccessPage() {
  const shell = "bd-container py-6 pb-14";
  const card = "bd-card p-6 sm:p-8 max-w-[560px] mx-auto";

  return (
    <main className={shell}>
      <div className={card}>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0b1220]">Account created ✅</h1>
        <p className="mt-2 text-sm text-black/60">
          Next: check your email and verify your account. After verification, log in to browse active listings, watch items, create listings, buy, offer, and message safely.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <Link href="/listings" className="bd-btn w-full text-center">
            Browse active listings
          </Link>

          <Link href="/sell/new" className="bd-btn bd-btn-primary w-full text-center">
            Create a buyer-ready listing
          </Link>

          <Link href="/auth/login" className="bd-btn w-full text-center">
            Go to login
          </Link>
        </div>

        <p className="mt-4 text-xs text-black/55">
        </p>
      </div>
    </main>
  );
}
