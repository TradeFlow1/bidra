import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactFormClient from "./contact-form-client";

export default async function ContactPage() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const email = String(session?.user?.email || "").trim();

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Contact</h1>
      <p className="mt-2 text-sm text-gray-600">
        Messages are sent to Bidra support. For urgent safety issues, use Support &amp; Safety.
      </p>

      {!isAuthed ? (
        <div className="mt-4 rounded-xl border bg-white p-4">
          <div className="text-sm font-extrabold bd-ink">Sign in required</div>
          <p className="mt-1 text-sm bd-ink2">
            To contact the Bidra team, please sign in first. You can still read Support &amp; Safety while logged out.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/auth/login?next=/contact" className="bd-btn bd-btn-primary">Sign in</Link>
            <Link href="/auth/register" className="bd-btn bd-btn-ghost">Create account</Link>
            <Link href="/support" className="bd-btn bd-btn-ghost">Support &amp; Safety</Link>
            <Link href="/feedback" className="bd-btn bd-btn-ghost">Feedback</Link>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <ContactFormClient defaultEmail={email} />
        </div>
      )}
    </main>
  );
}
