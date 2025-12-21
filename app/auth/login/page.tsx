"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";

export default function Login() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-neutral-700">Use your email and password.</p>

      <Card className="mt-4">
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "");
            const password = String(fd.get("password") ?? "");

            const res = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/" });
            if (res?.error) setError("Invalid email or password.");
            else window.location.href = res?.url || "/";
          }}
        >
          <label className="text-sm">Email</label>
          <Input name="email" type="email" required />
          <label className="text-sm">Password</label>
          <Input name="password" type="password" required />
          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Log in</Button>

          {error ? <div className="text-sm text-red-700">{error}</div> : null}

          <div className="text-sm text-neutral-700">
            DonÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢t have an account? <Link href="/auth/register" className="hover:underline">Create one</Link>.
          </div>
        </form>
      </Card>
    </div>
  );
}
