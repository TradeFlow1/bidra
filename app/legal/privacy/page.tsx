import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Privacy Policy — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function H3({ children }: { children: any }) {
  return <h3 className="text-base font-extrabold bd-ink">{children}</h3>;
}
function Bullet({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}
function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Privacy Policy</h1>
          <p className="bd-ink2 leading-7">
            This policy explains how Bidra collects, uses, stores, and shares information when you browse or use the marketplace.
            Bidra is an Australian platform marketplace; items are listed and sold by users.
          </p>
          <Callout>
            <strong className="bd-ink">Plain-language summary:</strong>{" "}
            <span className="bd-ink2">
              We collect only what we need to run the platform (accounts, listings, messages, orders, safety).
              We don’t sell your personal information.
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) What we collect</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet><strong className="bd-ink">Account data</strong> (e.g., email, username/display name, password hash, verification status).</Bullet>
              <Bullet><strong className="bd-ink">Profile/location</strong> (e.g., suburb/state/postcode) used to show approximate location and improve local browsing.</Bullet>
              <Bullet><strong className="bd-ink">Listings</strong> (photos, title, description, condition, price, category, location shown on the listing).</Bullet>
              <Bullet><strong className="bd-ink">Messages</strong> between users (used to operate chat, moderation, and safety enforcement).</Bullet>
              <Bullet><strong className="bd-ink">Orders and activity</strong> (order events, offer events, basic logs needed for platform integrity).</Bullet>
              <Bullet><strong className="bd-ink">Technical data</strong> (IP address, device/browser data, cookies/session data, and diagnostic logs to prevent fraud and keep the service stable).</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>2) Why we collect it</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>To create and manage accounts, authentication, and security.</Bullet>
              <Bullet>To publish listings, enable messaging, offers, and orders.</Bullet>
              <Bullet>To prevent fraud, detect abuse, and enforce prohibited items and safety rules.</Bullet>
              <Bullet>To provide customer support and respond to reports.</Bullet>
              <Bullet>To improve the product (performance, reliability, usability) using aggregated diagnostics.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>3) What we share (and what we don’t)</H2>
            <p className="text-sm bd-ink2 leading-7">
              We share only what is necessary to operate the marketplace and meet safety/legal requirements.
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet><strong className="bd-ink">Public content:</strong> listings and seller display name are visible to users.</Bullet>
              <Bullet><strong className="bd-ink">Service providers:</strong> hosting, database, email delivery, analytics/monitoring (as needed to operate the site).</Bullet>
              <Bullet><strong className="bd-ink">Safety/legal:</strong> we may disclose information if required by law or to protect users (e.g., responding to lawful requests).</Bullet>
            </ul>
            <p className="text-sm bd-ink2 leading-7">
              <strong className="bd-ink">We do not sell personal information.</strong>
            </p>
          </section>

          <section className="space-y-2">
            <H2>4) Cookies and tracking</H2>
            <p className="text-sm bd-ink2 leading-7">
              We use cookies and similar technologies for login sessions, security, and site functionality.
              We may also use limited analytics to understand usage and improve performance.
            </p>
          </section>

          <section className="space-y-2">
            <H2>5) Data retention</H2>
            <p className="text-sm bd-ink2 leading-7">
              We keep information only as long as needed for platform operation, safety enforcement, dispute handling, and legal obligations.
              Some logs or records may be retained longer where required for fraud prevention or compliance.
            </p>
          </section>

          <section className="space-y-2">
            <H2>6) Your choices and rights</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>You can update your profile information in your account settings.</Bullet>
              <Bullet>You can request access to, correction of, or deletion of certain personal information (subject to legal/safety retention requirements).</Bullet>
              <Bullet>You can choose what you include in listings and messages — avoid sharing sensitive information.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>7) Children</H2>
            <p className="text-sm bd-ink2 leading-7">
              Bidra accounts are for adults aged 18+. Under 18s may browse publicly but cannot create accounts, list items, message, make offers, or transact.
            </p>
          </section>

          <section className="space-y-2">
            <H2>8) Contact</H2>
            <p className="text-sm bd-ink2 leading-7">
              For privacy questions or requests, contact us via the Contact page.
            </p>
            <p className="text-sm">
              <Link href="/contact" className="bd-link font-semibold">Contact →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This policy is intended for use in Australia. We may update it over time — the latest version is always posted here.
          </p>
        </div>

        <p className="text-xs bd-ink2 opacity-70">
          Related: <Link href="/legal/terms" className="bd-link font-semibold">Terms</Link> ·{" "}
          <Link href="/support" className="bd-link font-semibold">Support &amp; Safety</Link>
        </p>
      </div>
    </main>
  );
}
