"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, Button, Input } from "@/components/ui";

export default function Register() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  if (status === "ok") {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">Account created</h1>
        <p className="mt-2 text-neutral-700">You can now log in.</p>
        <Link href="/auth/login" className="mt-4 inline-block rounded-md bg-black text-white px-4 py-2 text-sm font-medium">
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Create account</h1>
      <p className="mt-1 text-sm text-neutral-700">Minimum password length: 8 characters.</p>

      <Card className="mt-4">
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setStatus("idle");
            setMessage("");

            const fd = new FormData(e.currentTarget);
            const payload = {
              email: String(fd.get("email") ?? ""),
              password: String(fd.get("password") ?? "")
            };

            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload)
            });

            if (res.ok) setStatus("ok");
            else {
              const data = await res.json().catch(() => ({}));
              setStatus("error");
              setMessage(data?.error || "Registration failed");
            }
          }}
        >
          <label className="text-sm">Email</label>
          <Input name="email" type="email" required />
          <label className="text-sm">Password</label>
          <Input name="password" type="password" required minLength={8} />
          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Create account</Button>

          {status === "error" ? <div className="text-sm text-red-700">{message}</div> : null}

          <div className="text-sm text-neutral-700">
            Already have an account? <Link href="/auth/login" className="hover:underline">Log in</Link>.
          </div>
        </form>
      </Card>
    </div>
  );
}
