import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactForm from "./contact-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Contact — Bidra" };

const SUPPORT_EMAIL = "support@bidra.com.au";

function SectionTitle(props: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold tracking-tight bd-ink">{props.children}</h2>;
}

function InfoCard(props: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm bd-ink2 leading-7 shadow-sm">
      {props.children}
    </div>
  );
}

function TopicCard(props: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm font-extrabold bd-ink">{props.title}</div>
      <div className="mt-1 text-sm bd-ink2 leading-7">{props.desc}</div>
    </div>
  );
}

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;

  const defaultEmail = String((user as any)?.email || "").trim();

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Contact</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Support that moves quickly</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Need help with a listing, messages, or an order? Use the options below so we can investigate faster and give you the right next step.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href={"mailto:" + SUPPORT_EMAIL} className="bd-btn bd-btn-primary text-center">
                Email support
              </a>
              <Link href="/support" className="bd-btn bd-btn-ghost text-center">
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Fastest option</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Email support</div>
            <div className="mt-1 text-sm text-neutral-600">{SUPPORT_EMAIL}</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Best evidence</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Links and screenshots</div>
            <div className="mt-1 text-sm text-neutral-600">Include URLs, order IDs, listing IDs, and exact error text.</div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Safety first</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">Stop and report</div>
            <div className="mt-1 text-sm text-neutral-600">If you feel unsafe, stop engaging and report the situation immediately.</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <InfoCard>
              <strong className="bd-ink">Fastest option:</strong>{" "}
              <span className="bd-ink2">
                Email us at{" "}
                <a className="bd-link font-semibold" href={"mailto:" + SUPPORT_EMAIL}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </span>
            </InfoCard>

            <InfoCard>
              <strong className="bd-ink">Safety first:</strong>{" "}
              <span className="bd-ink2">
                If you feel unsafe, stop engaging and report the listing or thread. For emergencies, contact local authorities. See{" "}
                <Link href="/support" className="bd-link font-semibold">
                  Support and Safety
                </Link>
                .
              </span>
            </InfoCard>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle>What can we help with?</SectionTitle>
              <div className="mt-4 grid gap-3">
                <TopicCard
                  title="Listing help"
                  desc="Problems creating or editing a listing, photo uploads, category issues, or a listing that will not publish."
                />
                <TopicCard
                  title="Messages and abuse"
                  desc="Harassment, threats, spam, impersonation, or suspicious behaviour in a message thread."
                />
                <TopicCard
                  title="Orders and pickup flow"
                  desc="Issues with an order status, Buy Now flow, accepted offers, or pickup scheduling shown in the order."
                />
                <TopicCard
                  title="Account and access"
                  desc="Login trouble, verification problems, password resets, or account restrictions."
                />
                <TopicCard
                  title="Report follow-up"
                  desc="If you submitted a report and need to add extra context, screenshots, or links."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle>Include these details</SectionTitle>
              <ul className="mt-3 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
                <li>Link to the listing, order, or message thread.</li>
                <li>What you expected to happen versus what happened.</li>
                <li>Exact error text, plus screenshots if available.</li>
                <li>Date or time and the email or username you used.</li>
                <li>Never share passwords or verification codes.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle>Response times</SectionTitle>
              <p className="mt-3 text-sm bd-ink2 leading-7">
                We aim to respond as soon as possible. Safety reports are prioritised. Complex investigations may take longer if we need to review logs, account history, or reports.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle>Send a support message</SectionTitle>

              {!user ? (
                <div className="mt-4 rounded-2xl border border-black/10 bg-neutral-50 p-5">
                  <div className="text-sm bd-ink2 leading-7">
                    To reduce spam, the support form requires you to be signed in. You can still email us at{" "}
                    <a className="bd-link font-semibold" href={"mailto:" + SUPPORT_EMAIL}>
                      {SUPPORT_EMAIL}
                    </a>
                    .
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/auth/login?next=/contact" className="bd-btn bd-btn-primary text-center">
                      Log in to use the form
                    </Link>
                    <Link href="/auth/register" className="bd-btn bd-btn-ghost text-center">
                      Create account
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <ContactForm defaultEmail={defaultEmail} />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <SectionTitle>Other useful pages</SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Link href="/how-it-works" className="bd-btn bd-btn-ghost text-center">How it works</Link>
                <Link href="/legal" className="bd-btn bd-btn-ghost text-center">Legal hub</Link>
                <Link href="/legal/prohibited-items" className="bd-btn bd-btn-ghost text-center">Prohibited items</Link>
                <Link href="/legal/terms" className="bd-btn bd-btn-ghost text-center">Terms</Link>
                <Link href="/legal/privacy" className="bd-btn bd-btn-ghost text-center">Privacy</Link>
              </div>
            </div>

            <p className="text-xs bd-ink2 opacity-70">
              Plain-language help for Australia. Bidra is a platform marketplace and items are sold by users.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
