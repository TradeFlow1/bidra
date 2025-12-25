"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm opacity-80">
            Try again. If it keeps happening, it’s likely a temporary server issue.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => reset()}
              className="rounded-xl bg-black px-4 py-2 text-white"
            >
              Try again
            </button>
            <Link href="/" className="rounded-xl border bg-white px-4 py-2">
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
