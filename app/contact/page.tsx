export const metadata = {
  title: "Contact — Bidra",
};

export default function ContactPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Contact</h1>
          <p className="text-sm bd-ink2">
            Need help with Bidra or a safety concern? Start with Support &amp; Safety, or use Feedback to report bugs and product issues.
          </p>
        </header>

        <div className="rounded-xl border bd-bd bg-white p-5 space-y-3">
          <div className="text-sm font-extrabold bd-ink">Fastest options</div>
          <ul className="list-disc pl-6 text-sm bd-ink2 space-y-1">
            <li>
              <a className="bd-link font-semibold" href="/support">Support &amp; Safety</a> — safety tips, scams, reporting guidance.
            </li>
            <li>
              <a className="bd-link font-semibold" href="/feedback">Feedback</a> — report what’s broken or confusing (you can submit while logged out).
            </li>
          </ul>
        </div>

        <div className="rounded-xl border bd-bd bg-white p-5 space-y-3">
          <div className="text-sm font-extrabold bd-ink">About Bidra</div>
          <p className="text-sm bd-ink2">
            Bidra is a platform only and is not the seller of items listed. For transaction disputes, start by communicating with the other party and
            keep records in Bidra messaging. If something is unsafe or prohibited, use reporting tools.
          </p>
          <div className="flex flex-wrap gap-2">
            <a className="bd-btn bd-btn-outline" href="/legal/terms">Terms</a>
            <a className="bd-btn bd-btn-outline" href="/legal/privacy">Privacy</a>
            <a className="bd-btn bd-btn-outline" href="/legal/prohibited-items">Prohibited items</a>
          </div>
        </div>

        <p className="text-xs bd-ink2">
          Note: If you need to report a specific listing or message thread, please use the in-product Report button for the fastest review.
        </p>
      </div>
    </main>
  );
}
