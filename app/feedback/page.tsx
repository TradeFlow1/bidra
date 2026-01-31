import Link from "next/link";
import { auth } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export const metadata = { title: "Feedback — Bidra" };

export default async function FeedbackPage() {
  noStore();
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Feedback</h1>
        <p className="mt-2 bd-ink2">Feedback helps build trust on Bidra.</p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
          <div className="text-sm font-extrabold bd-ink">
            {signedIn ? "You're signed in" : "Sign in required"}
          </div>
          <p className="mt-2 text-sm bd-ink2">
            Feedback is tied to completed orders.{" "}
            {signedIn ? "Go to your orders to leave feedback." : "Sign in to view your orders and leave feedback."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {signedIn ? (
              <Link href="/orders" className="bd-btn bd-btn-solid">Go to orders</Link>
            ) : (
              <>
                <Link href="/auth/login?next=/feedback" className="bd-btn bd-btn-solid">Sign in</Link>
                <Link href="/auth/register" className="bd-btn bd-btn-outline">Create account</Link>
              </>
            )}
            <Link href="/support" className="bd-btn bd-btn-outline">Support &amp; Safety</Link>
            <Link href="/contact" className="bd-btn bd-btn-outline">Contact</Link>
          </div>
        </div>

        {FT_ENABLED ? (
          <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
            <div className="text-base font-extrabold bd-ink">Friend Test feedback</div>
            <p className="mt-2 text-sm bd-ink2">
              During the private Friend Test, you can send product feedback directly to the team.
            </p>
            <div className="mt-4">
              <Link href="/ft/feedback" className="bd-btn bd-btn-solid">
                Send Friend Test feedback
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
            <div className="text-base font-extrabold bd-ink">Leaving feedback on a purchase</div>
            <p className="mt-2 text-sm bd-ink2">
              Once signed in, leave feedback from your completed orders.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {signedIn ? (
                <Link href="/orders" className="bd-btn bd-btn-solid">View completed orders</Link>
              ) : (
                <Link href="/auth/login?next=/orders" className="bd-btn bd-btn-solid">Sign in</Link>
              )}
              <Link href="/support" className="bd-btn bd-btn-outline">Support &amp; Safety</Link>
              <Link href="/contact" className="bd-btn bd-btn-outline">Contact</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
