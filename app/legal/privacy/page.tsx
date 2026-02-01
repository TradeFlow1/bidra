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
function P({ children }: { children: any }) {
  return <p className="text-sm bd-ink2 leading-7">{children}</p>;
}
function Li({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}

const SUPPORT_EMAIL = "support@bidra.com.au";

export default function PrivacyPolicyPage() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Privacy Policy</h1>
          <P>
            Bidra is an Australian marketplace platform. This Privacy Policy explains how we collect, use, disclose, and store
            personal information when you use Bidra.
          </P>
          <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
            <div>
              <span className="font-semibold bd-ink">Effective:</span> {today}
            </div>
            <div className="mt-1">
              <span className="font-semibold bd-ink">Contact:</span>{" "}
              <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Who we are</H2>
            <P>
              “Bidra”, “we”, “us”, or “our” refers to the Bidra platform. Bidra provides tools for listings, messaging, offers, and orders.
              Items are sold by users. Unless clearly stated otherwise, Bidra is not the seller of items listed by users.
            </P>
          </section>

          <section className="space-y-3">
            <H2>2) What we collect</H2>
            <div className="space-y-2">
              <H3>Information you provide</H3>
              <ul className="list-disc pl-6 space-y-1">
                <Li>Account details: email, password (stored as a secure hash), and profile details you choose to provide.</Li>
                <Li>Age eligibility: date of birth or other signals used to enforce Bidra’s 18+ account policy.</Li>
                <Li>Location details: suburb, state, and postcode (used to show listings and help buyers/sellers coordinate).</Li>
                <Li>Listings content: titles, descriptions, categories, photos, and related listing details.</Li>
                <Li>Messages: content you send in Bidra message threads.</Li>
                <Li>Orders and offers: actions you take (e.g., placing offers, Buy Now purchases, accepting offers).</Li>
                <Li>Reports and feedback: reports you submit, and any feedback/reviews you choose to leave.</Li>
              </ul>
            </div>

            <div className="space-y-2">
              <H3>Information collected automatically</H3>
              <ul className="list-disc pl-6 space-y-1">
                <Li>Device and log data: IP address, browser type, pages viewed, timestamps, and basic diagnostic events.</Li>
                <Li>Cookies and similar technologies: used for login sessions, security, and performance.</Li>
              </ul>
              <P>
                We try to minimise collection and only collect what we need to operate Bidra safely and reliably.
              </P>
            </div>
          </section>

          <section className="space-y-2">
            <H2>3) How we use personal information</H2>
            <ul className="list-disc pl-6 space-y-1">
              <Li>To create and manage accounts and enforce eligibility (including 18+ accounts).</Li>
              <Li>To provide platform features (listings, messaging, offers, orders, watchlist).</Li>
              <Li>To prevent fraud, abuse, prohibited items, and unsafe behaviour.</Li>
              <Li>To respond to support requests and investigate reports.</Li>
              <Li>To maintain system security, performance, and debugging.</Li>
              <Li>To comply with legal obligations and respond to lawful requests.</Li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>4) When we share information</H2>
            <P>We may share limited personal information in the following circumstances:</P>
            <ul className="list-disc pl-6 space-y-1">
              <Li>
                <span className="font-semibold bd-ink">Between buyers and sellers:</span> information shown in listings and messages,
                and information needed to complete an order (for example, arranging pickup/delivery).
              </Li>
              <Li>
                <span className="font-semibold bd-ink">Service providers:</span> infrastructure, hosting, analytics, and email services
                that support Bidra (they process data on our instructions).
              </Li>
              <Li>
                <span className="font-semibold bd-ink">Safety and legal:</span> where required by law, to enforce our Terms, to protect users,
                or to respond to safety incidents.
              </Li>
            </ul>
            <P>
              We do not sell personal information.
            </P>
          </section>

          <section className="space-y-2">
            <H2>5) Messages and moderation</H2>
            <P>
              Messages are stored to deliver the messaging feature, investigate reports, and enforce platform safety.
              We may review messages and listings content where needed to respond to reports, suspected scams, harassment, or prohibited items.
            </P>
            <P>
              If you see suspicious behaviour, report the listing or message thread. See{" "}
              <Link href="/support" className="bd-link font-semibold">
                Support &amp; Safety →
              </Link>
              .
            </P>
          </section>

          <section className="space-y-2">
            <H2>6) Cookies</H2>
            <P>
              Bidra uses cookies (or similar technologies) to keep you signed in, protect your account, and help the site work correctly.
              You can usually control cookies through your browser settings, but some site features may not work without them.
            </P>
          </section>

          <section className="space-y-2">
            <H2>7) Data storage, security, and retention</H2>
            <P>
              We store personal information using reputable infrastructure and apply reasonable safeguards (access controls, encryption in transit,
              and secure password hashing). No online service is 100% secure, but we work to protect your data.
            </P>
            <P>
              We retain information only as long as needed to operate Bidra, comply with legal obligations, resolve disputes, and enforce safety.
              We may keep logs and audit events for longer where needed for security and abuse prevention.
            </P>
          </section>

          <section className="space-y-2">
            <H2>8) Access, correction, and complaints</H2>
            <P>
              You can request access to, or correction of, your personal information. If you have a privacy concern or complaint, contact us at{" "}
              <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              . We’ll respond within a reasonable time.
            </P>
          </section>

          <section className="space-y-2">
            <H2>9) Under 18s</H2>
            <P>
              Bidra accounts are for users aged 18+. Under 18s may be able to browse public pages but cannot create accounts or transact.
              If you believe a minor has created an account, contact us.
            </P>
          </section>

          <section className="space-y-2">
            <H2>10) Changes to this policy</H2>
            <P>
              We may update this Privacy Policy from time to time. We’ll post the updated version on this page and update the effective date.
            </P>
          </section>

          <section className="space-y-2">
            <H2>Related pages</H2>
            <ul className="list-disc pl-6 space-y-1">
              <Li>
                <Link href="/legal/terms" className="bd-link font-semibold">
                  Terms →
                </Link>
              </Li>
              <Li>
                <Link href="/legal/prohibited-items" className="bd-link font-semibold">
                  Prohibited Items →
                </Link>
              </Li>
              <Li>
                <Link href="/contact" className="bd-link font-semibold">
                  Contact →
                </Link>
              </Li>
            </ul>
          </section>
        </div>

        <p className="text-xs bd-ink2 opacity-70">
          This Privacy Policy is general information about how Bidra handles personal information on the platform.
        </p>
      </div>
    </main>
  );
}
