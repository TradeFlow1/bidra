export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 30 }}>Help</h1>
        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8 }}>
          Quick guidance for using Bidra. We'll add FAQs here later.
        </p>
      </header>

      <section style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>How it works</h2>
        <ol style={{ marginTop: 8, lineHeight: 1.7 }}>
          <li>Create a listing (fixed price).</li>
          <li>Connect with buyers locally.</li>
          <li>
            After a sale, buyer & seller arrange pickup or postage directly. Bidra records outcomes and helps enforce policy if needed.
          </li>
          <li>Feedback is required to complete a sale.</li>
        </ol>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>FAQ (coming soon)</h2>
        <ul style={{ lineHeight: 1.7, opacity: 0.85 }}>
          <li>How do offers work?</li>
          <li>What items are prohibited?</li>
          <li>How do I report a problem?</li>
          <li>How do I update my location?</li>
        </ul>
      </section>

      <p style={{ marginTop: 24 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </main>
  );
}
