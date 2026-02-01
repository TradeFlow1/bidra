import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Prohibited items — Bidra" };

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

export default function ProhibitedItemsPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">
            Prohibited items
          </h1>
          <p className="bd-ink2 leading-7">
            Bidra is an Australian marketplace platform. For safety and compliance, some items can’t be listed.
            Prohibited items are blocked at listing creation.
          </p>

          <Callout>
            <strong className="bd-ink">Important:</strong>{" "}
            <span className="bd-ink2">
              If your item is prohibited, don’t try to “work around” the rules (for example: hiding details in photos, using code words,
              or listing it in a different category). Repeated attempts may lead to account restrictions.
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>Zero-tolerance (always prohibited)</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Vapes, e-cigarettes, vape liquids, nicotine pouches, tobacco products, and related accessories.</Bullet>
              <Bullet>Alcohol (any kind), including unopened bottles/cans and homebrew equipment marketed for alcohol.</Bullet>
              <Bullet>Sexual content and fetish items (pornographic material, explicit products, “adult services”).</Bullet>
              <Bullet>Illegal drugs, drug paraphernalia, and controlled substances.</Bullet>
              <Bullet>Weapons and weapon parts (including prohibited knives), ammunition, and weapon accessories intended for harm.</Bullet>
              <Bullet>Stolen goods, counterfeit goods, or items that infringe intellectual property rights.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Restricted / unsafe categories</H2>
            <p className="text-sm bd-ink2 leading-7">
              Some categories are not allowed because they create a high risk of harm, fraud, or legal issues.
              If in doubt, don’t list it and contact support.
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Hazardous chemicals, poisons, pesticides, or anything requiring special handling.</Bullet>
              <Bullet>Medical items that are prescription-only or require professional oversight.</Bullet>
              <Bullet>Items encouraging self-harm or violence.</Bullet>
              <Bullet>Spyware/surveillance devices marketed for covert monitoring.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>How enforcement works</H2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <Bullet>Prohibited items are blocked at listing creation (server-side).</Bullet>
              <Bullet>Attempts may be logged for moderation review.</Bullet>
              <Bullet>Repeated attempts can lead to restrictions, suspensions, or other enforcement.</Bullet>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Report a prohibited item</H2>
            <p className="text-sm bd-ink2 leading-7">
              If you see something that shouldn’t be listed, use the Report button on the listing or in the message thread.
              This helps keep the marketplace safe.
            </p>
            <p className="text-sm">
              <Link href="/support" className="bd-link font-semibold">
                Support &amp; Safety →
              </Link>
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This page is a plain-language summary for Australia. For full rules, see Terms and Privacy.
          </p>
        </div>
      </div>
    </main>
  );
}
