import Link from "next/link";
import { Suspense } from "react";
import SiteHeaderClient from "./site-header-client";

export default function SiteHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-semibold">
          Bidra
        </Link>

        <Suspense fallback={null}>
          <SiteHeaderClient />
        </Suspense>
      </div>
    </header>
  );
}
