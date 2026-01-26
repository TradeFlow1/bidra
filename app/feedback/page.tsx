import Link from "next/link";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export default function FeedbackPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Feedback</h1>
      <p className="mt-2 text-sm text-gray-600">Feedback helps build trust on Bidra.</p>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <div className="text-sm font-extrabold bd-ink">Sign in required</div>
        <p className="mt-1 text-sm bd-ink2">
          Feedback is tied to completed orders. Sign in to view your orders and leave feedback.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/auth/login?next=/feedback" className="bd-btn bd-btn-primary">Sign in</Link>
          <Link href="/auth/register" className="bd-btn bd-btn-ghost">Create account</Link>
          <Link href="/support" className="bd-btn bd-btn-ghost">Support &amp; Safety</Link>
          <Link href="/contact" className="bd-btn bd-btn-ghost">Contact</Link>
        </div>
      </div>

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
            Once signed in, leave feedback from your completed orders.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/auth/login?next=/orders" className="bd-btn bd-btn-primary">Sign in</Link>
            <Link href="/support" className="bd-btn bd-btn-ghost">Support &amp; Safety</Link>
            <Link href="/contact" className="bd-btn bd-btn-ghost">Contact</Link>
          </div>
        </div>
      )}
    </main>
  );
}
