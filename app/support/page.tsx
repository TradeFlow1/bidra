import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Support & Safety — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}

function Callout({ children }: { children: any }) {
  return (
    <div className="rounded-xl border bd-bd bg-white p-4 text-sm bd-ink2 leading-7">
      {children}
    </div>
  );
}

function Bullet({ children }: { children: any }) {
  return <li className="text-sm bd-ink2 leading-7">{children}</li>;
}

export default function SupportPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">
            Support &amp; Safety
          </h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform. Items are sold by users. We provide tools for messaging,
            offers, and orders — plus reporting and moderation to help keep the platform safe.
          </p>

          <Callout>
            <strong className="bd-ink">If you feel unsafe:</strong>{" "}
            <span className="bd-ink2">
              stop the conversation, don’t meet up, and report the listing or message thread. In an emergency,
              contact local authorities.
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>Spot common scams</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Pressure to move off-platform immediately (“text me”, “WhatsApp only”, “send code”).</Bullet>
              <Bullet>Unusual urgency or emotional manipulation.</Bullet>
              <Bullet>Overpayment or “shipping agent” stories.</Bullet>
              <Bullet>Requests for passwords, verification codes, or remote access.</Bullet>
              <Bullet>Links to external payment pages that don’t match the Bidra order flow.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Meetups and inspections</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Meet in public places when possible (shopping centres, stations, cafés).</Bullet>
              <Bullet>Bring a friend for high-value items.</Bullet>
              <Bullet>Inspect the item before paying or marking an order complete.</Bullet>
              <Bullet>For pickups at a home address, share your plan with someone you trust.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Payments (avoid being tricked)</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you pay by bank transfer (PayID/Osko), treat it like cash — it can be hard to reverse. Only pay when you’re confident the listing
              is legitimate and you’ve agreed on clear handover terms.
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Never pay to “reserve” an item without clear proof and agreement.</Bullet>
              <Bullet>Be cautious with interstate shipping and brand-new accounts.</Bullet>
              <Bullet>Keep a record of the listing, chat, and order details.</Bullet>
            </ul>
            <p className="text-sm mt-3">
              <Link href="/legal/fees" className="bd-link font-semibold">Fees →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>Reporting and moderation</H2>
            <p className="text-sm bd-ink2 leading-7">
              You can report listings and message threads. Reports go to the Bidra admin team for review.
              Where required, we may remove listings, restrict accounts, or take other enforcement action.
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Report prohibited items, scams, harassment, threats, or suspicious behaviour.</Bullet>
              <Bullet>If a listing looks unsafe or illegal, don’t engage — report it.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Prohibited items</H2>
            <p className="text-sm bd-ink2 leading-7">
              Some items can’t be listed on Bidra. Prohibited items are blocked at listing creation, and repeated attempts may lead to restrictions.
            </p>
            <p className="text-sm">
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">Prohibited Items →</Link>
            </p>
          </section>

          <section className="space-y-2">
            <H2>Need help?</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you need help with a listing, an order, or a safety concern, contact us and include any relevant links or screenshots.
            </p>
            <p className="text-sm">
              <Link href="/contact" className="bd-link font-semibold">Contact →</Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This page is guidance only. For the full rules of use, see Terms and Privacy.
          </p>
        </div>
      </div>
    </main>
  );
}
