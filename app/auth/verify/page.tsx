import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Verify your email — Bidra",
};

function Shell(props: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">{props.eyebrow}</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">{props.title}</h1>
            <p className="mt-2 text-sm bd-ink2 sm:text-base">{props.subtitle}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold bd-ink">Why verification matters</div>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold bd-ink">Protects account access</div>
                  <div className="mt-1 text-sm bd-ink2">
                    Verifying your email helps confirm account ownership and keeps login and recovery steps secure.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Needed before login</div>
                  <div className="mt-1 text-sm bd-ink2">
                    New Bidra accounts must verify email before they can log in and continue with buying or selling.
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="text-sm font-semibold bd-ink">Need another route?</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link href="/auth/login" className="bd-btn bd-btn-ghost">Log in</Link>
                    <Link href="/support" className="bd-btn bd-btn-ghost">Support</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            {props.children}
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = String(searchParams?.token ?? "").trim();

  if (!token) {
    return (
      <Shell
        eyebrow="Email verification"
        title="Verify your email"
        subtitle="Use the verification link sent to your email address to activate your account."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Missing token. Please use the link from the verification email.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/login" className="bd-btn bd-btn-primary w-full text-center">
              Log in
            </Link>
            <Link href="/support" className="bd-btn bd-btn-ghost w-full text-center">
              Contact support
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const vt = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!vt || vt.expiresAt.getTime() < Date.now()) {
    return (
      <Shell
        eyebrow="Email verification"
        title="Verification link expired"
        subtitle="This verification link is no longer valid, but you can easily start again."
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Please register again or request a new verification link.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="bd-btn bd-btn-primary w-full text-center">
              Create account
            </Link>
            <Link href="/auth/login" className="bd-btn bd-btn-ghost w-full text-center">
              Log in
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  await prisma.user.update({ where: { id: vt.userId }, data: { emailVerified: true, isActive: true } });
  await prisma.verificationToken.delete({ where: { id: vt.id } });

  return (
    <Shell
      eyebrow="Email verification"
      title="Email verified"
      subtitle="Your account is now activated and ready for login."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Your email is verified. You can now log in.
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/auth/login" className="bd-btn bd-btn-primary w-full text-center">
            Log in
          </Link>
          <Link href="/" className="bd-btn bd-btn-ghost w-full text-center">
            Go home
          </Link>
        </div>
      </div>
    </Shell>
  );
}
