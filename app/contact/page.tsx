import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactForm from "./contact-form";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appNarrowShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Contact - Bidra" };

const SUPPORT_EMAIL = "support@bidra.com.au";

function SectionTitle(props: { children: React.ReactNode }) {
  return <h2 className="text-lg font-extrabold tracking-tight bd-ink">{props.children}</h2>;
}

const buttonClass = "inline-flex h-11 w-full items-center justify-center rounded-2xl border border-[#D8E1F0] bg-white px-5 text-sm font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] sm:w-auto";

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user;
  const defaultEmail = String((user as any)?.email || "").trim();

  return (
    <ReferencePage>
      <div className={appNarrowShell + " space-y-5 py-5 sm:py-8"}>
        <BackButton href="/listings" label="Back to marketplace" />
        <div className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Contact</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Contact support</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Send listing, order, message, account, or technical issues to support.
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <a href={"mailto:" + SUPPORT_EMAIL} className={buttonClass}>
                Email support
              </a>
              <Link href="/support" className={buttonClass}>
                Support
              </Link>
              <Link href="/disputes" className={buttonClass}>
                Resolution centre
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
            <SectionTitle>Send a support message</SectionTitle>
            <div className="mt-4">
              {!user ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                  No login required. Add your email so support can reply.
                </div>
              ) : null}
              <ContactForm defaultEmail={defaultEmail} />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-6">
            <SectionTitle>Before you send</SectionTitle>
            <div className="mt-4 space-y-5 text-sm bd-ink2 leading-7">
              <div>
                <div className="font-extrabold bd-ink">Email support</div>
                <p className="mt-1">Use the form or email support directly.</p>
                <a className="bd-link font-semibold" href={"mailto:" + SUPPORT_EMAIL}>
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div>
                <div className="font-extrabold bd-ink">What can we help you with?</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Use Contact for account, order, listing, billing, or technical issues.</li>
                  <li>Use Report for scams, prohibited items, abuse, or unsafe behaviour.</li>
                  <li>Use Feedback for product suggestions.</li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold bd-ink">Include details</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Listing, order, or message thread link.</li>
                  <li>A short description of the issue.</li>
                  <li>Screenshots, timestamps, or exact error text if available.</li>
                </ul>
              </div>

              <div>
                <div className="font-extrabold bd-ink">Safety</div>
                <p className="mt-1">
                  Report unsafe messages or listings. For emergencies, contact local authorities.
                </p>
              </div>

              <Link href="/support" className={buttonClass}>
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ReferencePage>
  );
}

