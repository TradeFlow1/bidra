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
          Next: log in to start using Bidra. Then you can browse and create your first listing.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3">
          <Link href="/listings" className="bd-btn w-full text-center">
            Browse listings
          </Link>

          <Link href="/sell/new" className="bd-btn bd-btn-primary w-full text-center">
            Create a listing
          </Link>

          <Link href="/auth/login" className="bd-btn w-full text-center">
            Log in
          </Link>
        </div>

        <p className="mt-4 text-xs text-black/55">
          Bidra is an Australian marketplace with seller-accepted offers (not auctions).
        </p>
      </div>
    </main>
  );
}
