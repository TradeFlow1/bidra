import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactForm from "./contact-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Contact â€” Bidra" };

const SUPPORT_EMAIL = "support@bidra.com.au";

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

function Row({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border bd-bd bg-white p-5">
      <div className="text-sm font-extrabold bd-ink">{title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{desc}</div>
    </div>
  );
}

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;

  const defaultEmail = String((user as any)?.email || "").trim();

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Contact</h1>
          <p className="bd-ink2 leading-7">
            Need help with a listing, messages, or an order? Use the options below so we can assist quickly.
          </p>

          <Callout>
            <strong className="bd-ink">Fastest option:</strong>{" "}
            <span className="bd-ink2">
              Email us at{" "}
              <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
              .
            </span>
          </Callout>

          <Callout>
            <strong className="bd-ink">Safety first:</strong>{" "}
            <span className="bd-ink2">
              If you feel unsafe, stop engaging and report the listing or thread. For emergencies, contact local authorities.
              See{" "}
              <Link href="/support" className="bd-link font-semibold">
                Support &amp; Safety â†’
              </Link>
            </span>
          </Callout>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-3">
            <H2>What can we help with?</H2>
            <div className="grid gap-3">
              <Row
                title="Listing help"
                desc="Problems creating or editing a listing, photo uploads, category issues, or a listing that wonâ€™t publish."
              />
              <Row
                title="Messages & abuse"
                desc="Harassment, threats, spam, impersonation, or suspicious behaviour in a message thread."
              />
              <Row
                title="Orders & pickup flow"
                desc="Issues with an order status, Buy Now flow, accepted offers, or pickup scheduling shown in the order."
              />
              <Row
                title="Account & access"
                desc="Login trouble, verification problems, password resets, or account restrictions."
              />
              <Row
                title="Report follow-up"
                desc="If youâ€™ve submitted a report and need to add extra context, screenshots, or links."
              />
            </div>
          </section>

          <section className="space-y-2">
            <H2>Include these details</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>Link to the listing, order, or message thread (copy the URL).</li>
              <li>What you expected to happen vs what happened.</li>
              <li>Exact error text (screenshots help).</li>
              <li>Date/time and the email/username you used (never share passwords or verification codes).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>Response times</H2>
            <p className="text-sm bd-ink2 leading-7">
              We aim to respond as soon as possible. Safety reports are prioritised. Complex investigations may take longer if we need
              to review logs and report history.
            </p>
          </section>

          <section className="space-y-2">
            <H2>Send a support message</H2>

            {!user ? (
              <div className="rounded-2xl border bd-bd bg-white p-5">
                <div className="text-sm bd-ink2 leading-7">
                  To reduce spam, the support form requires you to be signed in. You can still email us at{" "}
                  <a className="bd-link font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/auth/login?next=/contact" className="bd-btn bd-btn-primary text-center">
                    Log in to use the form
                  </Link>
                  <Link href="/auth/register" className="bd-btn text-center">
                    Create account
                  </Link>
                </div>
              </div>
            ) : (
              <ContactForm defaultEmail={defaultEmail} />
            )}
          </section>

          <section className="space-y-2">
            <H2>Other useful pages</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>
                <Link href="/how-it-works" className="bd-link font-semibold">
                  How it works â†’
                </Link>
              </li>
              <li>
                <Link href="/legal" className="bd-link font-semibold">
                  Legal hub â†’
                </Link>
              </li>
              <li>
                <Link href="/legal/prohibited-items" className="bd-link font-semibold">
                  Prohibited items â†’
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="bd-link font-semibold">
                  Terms â†’
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="bd-link font-semibold">
                  Privacy â†’
                </Link>
              </li>
            </ul>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            Plain-language help for Australia. Bidra is a platform marketplace; items are sold by users.
          </p>
        </div>
      </div>
    </main>
  );
}
