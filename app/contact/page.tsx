import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactForm from "./contact-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Contact - Bidra" };

const SUPPORT_EMAIL = "support@bidra.com.au";

function SectionTitle(props: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold tracking-tight bd-ink">{props.children}</h2>;
}

const buttonClass = "rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5";

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;
  const defaultEmail = String((user as any)?.email || "").trim();

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Contact</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Contact support</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Need help with a listing, message, order, or account? Send the details and we will review it.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href={"mailto:" + SUPPORT_EMAIL} className={buttonClass}>
                Email support
              </a>
              <Link href="/support" className={buttonClass}>
                Support and safety
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <SectionTitle>Send a support message</SectionTitle>
            <div className="mt-4">
              {!user ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  You can send support a message without logging in. Add your email so we can reply. A hidden spam field and rate limit help protect the form.
                </div>
              ) : null}
              <ContactForm defaultEmail={defaultEmail} />
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <SectionTitle>Before you send</SectionTitle>
            <div className="mt-4 space-y-5 text-sm bd-ink2 leading-7">
              <div>
                <div className="font-extrabold bd-ink">Email support</div>
                <p className="mt-1">No account required. Use the form or email us directly.</p>
                <a className="bd-link font-semibold" href={"mailto:" + SUPPORT_EMAIL}>
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div>
                <div className="font-extrabold bd-ink">Choose the right queue</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Use Contact for account access, order help, billing or fee questions, and technical problems that need a reply.</li>
                  <li>Use in-product Report for unsafe listings, scams, abuse, prohibited items, or message-thread behaviour that needs moderation evidence.</li>
                  <li>Use Feedback for product ideas, confusing copy, or non-urgent marketplace improvements.</li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold bd-ink">Include these details</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Listing, order, or message thread link.</li>
                  <li>What happened and what you expected.</li>
                  <li>Screenshots, timestamps, exact error text, and the best reply email.</li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold bd-ink">Safety first</div>
                <p className="mt-1">
                  If you feel unsafe, stop engaging and report the listing or message thread. For emergencies, contact local authorities.
                </p>
              </div>

              <Link href="/support" className={buttonClass}>
                Support and safety
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
