"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { BackButton } from "@/components/ui/back-button";

export const dynamic = "force-dynamic";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="bd-container py-10">
      <div className="mx-auto mb-4 w-full max-w-5xl px-4"><BackButton href="/" label="Back to home" /></div>
      <div className="bd-card p-6 max-w-md mx-auto">
        <h1 className="text-xl font-extrabold bd-ink">Logging you out…</h1>
        <p className="mt-2 text-sm bd-ink2">If you aren’t redirected, refresh this page.</p>
      </div>
    </main>
  );
}
