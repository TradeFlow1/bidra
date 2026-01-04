"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function LogoutPage() {
  useEffect(() => {
    // single canonical logout path
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="bd-container py-10">
      <div className="container max-w-xl">
        <div className="bd-card p-6">
          <div className="text-sm bd-ink2">Signing you out…</div>
        </div>
      </div>
    </main>
  );
}
