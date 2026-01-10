import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Verify your email — Bidra",
};

function Wrap(props: { title: string; children: React.ReactNode }) {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">{props.title}</h1>
        <div className="mt-6 bd-card p-6">{props.children}</div>
      </div>
    </main>
  );
}

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = String(searchParams?.token ?? "").trim();

  if (!token) {
    return (
      <Wrap title="Verify your email">
        <p className="text-sm bd-ink2">
          Missing token. Please use the link from the verification email.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/auth/login" className="bd-btn bd-btn-primary text-center">
            Log in
          </Link>
          <Link href="/support" className="bd-btn text-center">
            Contact support
          </Link>
        </div>
      </Wrap>
    );
  }

  const vt = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!vt || vt.expiresAt.getTime() < Date.now()) {
    return (
      <Wrap title="Verification link expired">
        <p className="text-sm bd-ink2">
          Please register again or request a new verification link.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/auth/register" className="bd-btn bd-btn-primary text-center">
            Create account
          </Link>
          <Link href="/auth/login" className="bd-btn text-center">
            Log in
          </Link>
        </div>
      </Wrap>
    );
  }

  await prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true, isActive: true } });
  await prisma.verificationToken.delete({ where: { id: vt.id } });

  return (
    <Wrap title="Email verified">
      <p className="text-sm bd-ink2">Your email is verified. You can now log in.</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link href="/auth/login" className="bd-btn bd-btn-primary text-center">
          Log in
        </Link>
        <Link href="/" className="bd-btn text-center">
          Go home
        </Link>
      </div>
    </Wrap>
  );
}
