"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // signOut will clear the session cookies.
      // We avoid trusting any returned URL and force a local relative redirect.
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    })();
  }, [router]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Signing out…</h1>
      <p className="mt-2 text-sm opacity-80">You&apos;ll be redirected shortly.</p>
    </main>
  );
}