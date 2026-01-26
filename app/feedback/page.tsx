import Link from "next/link";
import { auth } from "@/lib/auth";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export default async function FeedbackPage() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
      <p className="mt-2 text-sm text-gray-600">
        Feedback helps build trust on Bidra.
      </p>
      {!isAuthed ? (
        <div className="mt-4 rounded-xl border bg-white p-4">
          <div className="text-sm font-extrabold bd-ink">Sign in required for Contact</div>
          <p className="mt-1 text-sm bd-ink2">
            To contact the Bidra team, please sign in first. You can still read Support &amp; Safety while logged out.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/auth/login?next=/feedback" className="bd-btn bd-btn-primary">Sign in</Link>
            <Link href="/support" className="bd-btn bd-btn-ghost">Support &amp; Safety</Link>
            <Link href="/contact" className="bd-btn bd-btn-ghost">Contact</Link>
          </div>
        </div>
      ) : null}


      {FT_ENABLED ? (
        <div className="mt-6 rounded-xl border bg-white p-5">
          <div className="text-base font-extrabold bd-ink">Friend Test feedback</div>
          <p className="mt-2 text-sm text-gray-600">
            During the private Friend Test, you can send product feedback directly to the team.
          </p>
          <div className="mt-4">
            <Link href="/ft/feedback" className="bd-btn bd-btn-primary">
              Send Friend Test feedback
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border bg-white p-5">
          <div className="text-base font-extrabold bd-ink">Leaving feedback on a purchase</div>
          <p className="mt-2 text-sm text-gray-600">
            You can leave buyer or seller feedback from your completed orders.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/orders" className="bd-btn bd-btn-primary">
              Go to Orders
            </Link>
            <Link href="/support" className="bd-btn bd-btn-ghost">
              Support &amp; Safety
            </Link>
            <Link href="/contact" className="bd-btn bd-btn-ghost">
              Contact
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
