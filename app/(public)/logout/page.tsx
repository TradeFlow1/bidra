"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export const dynamic = "force-dynamic";

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="bd-container py-10">
      <div className="bd-card p-6 max-w-md mx-auto">
        <h1 className="text-xl font-extrabold bd-ink">Logging you out…</h1>
        <p className="mt-2 text-sm bd-ink2">If you aren’t redirected, refresh this page.</p>
      </div>
    </main>
  );
}
