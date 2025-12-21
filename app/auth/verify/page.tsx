import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = String(searchParams?.token ?? "").trim();
  if (!token) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-neutral-700">Missing token. Please use the link from the verification email/log.</p>
        <Link className="mt-4 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/auth/login">Log in</Link>
      </div>
    );
  }

  const vt = await prisma.verificationToken.findUnique({ where: { token }, include: { user: true } });
  if (!vt || vt.expiresAt.getTime() < Date.now()) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold">Verification link expired</h1>
        <p className="mt-2 text-neutral-700">Please register again or request a new verification link.</p>
        <Link className="mt-4 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/auth/register">Create account</Link>
      </div>
    );
  }

  await prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true } });
  await prisma.verificationToken.delete({ where: { id: vt.id } });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Email verified</h1>
      <p className="mt-2 text-neutral-700">Your email is verified. You can now log in.</p>
      <Link className="mt-4 inline-block rounded-md bg-black text-white px-4 py-2 text-sm font-medium" href="/auth/login">Log in</Link>
    </div>
  );
}
