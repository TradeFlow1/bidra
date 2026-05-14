import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";
import { getNotificationCounts } from "@/lib/notifications";
import { Card, Button, Input } from "@/components/ui";
import { BackButton } from "@/components/ui/back-button";
import AccountNav from "@/components/account-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

function Pill(props: { tone?: "ok" | "warn"; children: React.ReactNode }) {
  const tone = props.tone ?? "ok";
  const cls =
    tone === "ok"
      ? "bg-green-100 text-green-800 border border-green-200"
      : "bg-amber-100 text-amber-900 border border-amber-200";

  return (
    <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold " + cls}>
      {props.children}
    </span>
  );
}

function SurfaceCard(props: {
  title: string;
  subtitle?: string;
  tone?: "default" | "attention";
  children: React.ReactNode;
}) {
  const tone = props.tone ?? "default";
  const shell =
    tone === "attention"
      ? "rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm"
      : "rounded-3xl border border-[#D7E2F1] bg-white p-5 shadow-sm";

  return (
    <div className={shell}>
      <div className="flex flex-col gap-1">
        <div className="text-sm font-extrabold bd-ink">{props.title}</div>
        {props.subtitle ? <div className="text-sm bd-ink2">{props.subtitle}</div> : null}
      </div>
      <div className="mt-4">{props.children}</div>
    </div>
  );
}

function ActionLink(props: { href: string; children: React.ReactNode }) {
  return (
    <Link href={props.href} className="bd-link font-semibold">
      {props.children}
    </Link>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { saved?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/dashboard");

  const adult = await requireAdult(session);
  const me = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: me },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      postcode: true,
      suburb: true,
      state: true,
      country: true,
      emailVerified: true,
      isActive: true,
      ageVerified: true,
      phoneVerified: true,
      policyStrikes: true,
      policyBlockedUntil: true,
    },
  });
  if (!user) redirect("/auth/login?next=/dashboard");

  const counts = await getNotificationCounts(me);
  const saved = String(searchParams?.saved ?? "") === "1";
  const failed = String(searchParams?.saved ?? "") === "0";

  async function updateProfile(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const userId = s?.user?.id ? String(s.user.id) : "";
    if (!userId) redirect("/auth/login?next=/dashboard");

    const name = String(formData.get("name") ?? "").trim().slice(0, 60);
    const bio = String(formData.get("bio") ?? "").trim().slice(0, 280);
    const postcode = String(formData.get("postcode") ?? "").trim().slice(0, 10);
    const suburb = String(formData.get("suburb") ?? "").trim().slice(0, 60);
    const state = String(formData.get("state") ?? "").trim().slice(0, 10);

    const hasPostcode = postcode.length > 0;
    const hasSuburb = suburb.length > 0;
    const hasState = state.length > 0;

    if (!hasPostcode && !(hasSuburb && hasState)) {
      redirect("/dashboard?saved=0");
    }

    if (hasSuburb && !hasState) {
      redirect("/dashboard?saved=0");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || null,
        bio: bio || null,
        postcode: hasPostcode ? postcode : null,
        suburb: hasSuburb ? suburb : null,
        state: hasState ? state : null,
        country: "AU",
      },
    });

    redirect("/dashboard?saved=1");
  }

  const now = Date.now();
  const blockedUntilMs = user.policyBlockedUntil ? new Date(user.policyBlockedUntil).getTime() : 0;
  const isBlocked = blockedUntilMs > now;

  const myListingsCount = await prisma.listing.count({
    where: { sellerId: me, status: { not: "DELETED" } },
  });

  const ordersAsBuyerCount = await prisma.order.count({
    where: { buyerId: me },
  });

  const isAdminAccount = String(session.user.role || "").toUpperCase() === "ADMIN";
  const roleSummary = isAdminAccount ? "Admin account" : myListingsCount > 0 ? "Seller account" : "My Bidra";
  const sellerModeSummary = myListingsCount > 0 ? "Seller tools active" : "Seller tools ready";
  const buyerModeSummary = ordersAsBuyerCount > 0 ? "Buyer tools active" : "Buyer tools ready";

  const graceHours = 48;
  const cutoff = new Date(Date.now() - graceHours * 60 * 60 * 1000);

  const pendingBuyerFeedbackCount = await prisma.order.count({
    where: { buyerId: me, completedAt: { not: null, lt: cutoff }, buyerFeedbackAt: null },
  });

  const sinceTopOffers = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newTopOfferCount = await prisma.adminEvent.count({
    where: {
      type: "OFFER_NEW_TOP",
      userId: me,
      createdAt: { gte: sinceTopOffers },
    },
  });

  const hasAttention =
    !adult.ok ||
    isBlocked ||
    pendingBuyerFeedbackCount > 0 ||
    newTopOfferCount > 0 ||
    counts.actionOrders > 0;

  const displayName = user.name || session.user.name || session.user.email || "Your account";
  const locationSummary = [
    String(user.suburb ?? "").trim(),
    String(user.state ?? "").trim(),
    String(user.postcode ?? "").trim(),
  ].filter(Boolean).join(" - ");

  const accountSignalCount = [user.emailVerified, user.phoneVerified, user.ageVerified, Boolean(locationSummary)].filter(Boolean).length;
  const accountSignalLabel = accountSignalCount + "/4 account signals complete";
  const trustSignalSummary = accountSignalCount >= 3 ? "Strong account signal coverage" : "Add more account signals";const isFirstRunBuyer = ordersAsBuyerCount === 0 && counts.unreadThreads === 0;
  const isFirstRunSeller = myListingsCount === 0;
  const showFirstRunSetup = isFirstRunBuyer || isFirstRunSeller || !locationSummary;
  const onboardingSteps = [
    { title: "Set up trust basics", body: locationSummary ? "Your general location is added." : "Add suburb, state, and postcode so marketplace context is clear.", href: "#account-details", cta: "Update account" },
    { title: "Start as a buyer", body: "Browse active listings, watch items, and ask clear questions before pickup or postage.", href: "/listings", cta: "Browse listings" },
    { title: "Add real inventory", body: "Create a buyer-ready listing with real photos, condition, price, and pickup or postage notes.", href: "/sell/new", cta: "List an item" },
  ];

  return (
    <main className="bd-container py-4 sm:py-8">
      <div className="mx-auto mb-3 w-full max-w-5xl px-4"><BackButton href="/listings" label="Back to marketplace" /></div>
      <div className="container max-w-5xl space-y-3 sm:space-y-4">
        <div className="rounded-[24px] border border-[#D7E2F1] bg-gradient-to-br from-white to-[#F8FAFF] p-4 shadow-sm sm:p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607089]">Current account role</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight bd-ink sm:text-3xl">
            {roleSummary}
          </h1>
          <p className="mt-2 max-w-3xl text-sm bd-ink2 sm:text-base">
            Manage your buying, selling, messages, and account details.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ordersAsBuyerCount > 0 ? <Pill tone="ok">{buyerModeSummary}</Pill> : <Pill>{buyerModeSummary}</Pill>}
            {myListingsCount > 0 ? <Pill tone="ok">{sellerModeSummary}</Pill> : <Pill>{sellerModeSummary}</Pill>}
            {isAdminAccount ? <Pill tone="ok">Admin workspace enabled</Pill> : null}
          </div>
        </div>

        <AccountNav active="account" />

        <section id="account-status" className="scroll-mt-24 rounded-[24px] border border-[#D8E1F0] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-sm font-extrabold bd-ink">Account status</div>
              <p className="mt-1 text-sm leading-6 bd-ink2">
                Your marketplace access, account signals, and policy standing in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] px-4 py-3 text-sm font-extrabold text-[#0F172A]">
              {accountSignalLabel}
            </div>
          </div>
          <details className="mt-4 rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-[#0F172A] [&::-webkit-details-marker]:hidden">
              <span>Account signals</span>
              <span className="rounded-full border border-[#D7E2F1] bg-white px-3 py-1 text-xs font-extrabold text-[#0F172A]">{accountSignalLabel}</span>
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Email</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E]">{user.emailVerified ? "Confirmed" : "Not confirmed"}</div>
              <div className="mt-1 text-sm text-[#526173]">Supports access and recovery.</div>
            </div>
            <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Phone</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E]">{user.phoneVerified ? "Confirmed" : "Not confirmed"}</div>
              <div className="mt-1 text-sm text-[#526173]">{user.phoneVerified ? "Phone confirmation is active." : "May be required for protected actions."}</div>
            </div>
            <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">18+ account check</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E]">{user.ageVerified ? "Recorded" : "Review if needed"}</div>
              <div className="mt-1 text-sm text-[#526173]">Adults only.</div>
            </div>
            <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFC] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Policy standing</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight text-[#07152E]">{isBlocked || !adult.ok ? "Needs review" : "Clear"}</div>
              <div className="mt-1 text-sm text-[#526173]">{trustSignalSummary}. Policy strikes: {user.policyStrikes ?? 0}.</div>
            </div>
          </div>
          </details>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/auth/phone-verify" className="bd-btn bd-btn-secondary text-center">Confirm phone</Link>
            <Link href="#account-status" className="bd-btn bd-btn-secondary text-center">Account status</Link>
            <Link href="/support" className="bd-btn bd-btn-ghost text-center">What these signals mean</Link>
          </div>
        </section>
        {showFirstRunSetup ? (
          <section className="rounded-3xl border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">First-run setup</div>
            <p className="mt-1 text-sm bd-ink2">
              Start with buying, selling, or account setup.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {onboardingSteps.map((step) => (
                <Link key={step.title} href={step.href} className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFF] p-4 shadow-sm hover:bg-[#EEF4FF]">
                  <div className="text-sm font-extrabold text-[#07152E]">{step.title}</div>
                  <div className="mt-1 text-sm text-[#526173]">{step.body}</div>
                  <div className="mt-3 text-sm font-extrabold text-[#0B4DFF]">{step.cta}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/listings" className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#EEF4FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Selling</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{myListingsCount}</div>
            <div className="mt-1 text-sm text-[#526173]">Listings, drafts, offers, and seller tools.</div>
          </Link>

          <Link href="/orders" className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#EEF4FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Buying</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{ordersAsBuyerCount}</div>
            <div className="mt-1 text-sm text-[#526173]">Purchases, sales, handover, and feedback.</div>
          </Link>

          <Link href="/messages" className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#EEF4FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Messages</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">{counts.unreadThreads}</div>
            <div className="mt-1 text-sm text-[#526173]">Buyer and seller conversations.</div>
          </Link>

          <Link href="/watchlist" className="rounded-2xl border border-[#D7E2F1] bg-white p-4 shadow-sm hover:bg-[#EEF4FF]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Saved</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-[#07152E]">Open</div>
            <div className="mt-1 text-sm text-[#526173]">Watchlist and saved listings.</div>
          </Link>
        </div>

        {saved ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
            <div className="font-semibold">Account details updated</div>
          </div>
        ) : null}

        {failed ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 shadow-sm">
            <div className="font-semibold">Please fix your location</div>
            <div className="mt-1">Enter your postcode, suburb, and state. No street address.</div>
          </div>
        ) : null}

        <div id="account-details" className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[24px] border border-[#D7E2F1] bg-white p-4 shadow-sm sm:p-5">
            <div className="text-sm font-extrabold bd-ink">Account details</div>
            <div className="mt-1 text-sm bd-ink2">Role: {roleSummary}.</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Display name</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#07152E]">{displayName}</div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">Email</div>
                <div className="mt-1 text-sm font-semibold text-[#0F172A]">{user.email}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Pill tone={user.emailVerified ? "ok" : "warn"}>
                  Email: {user.emailVerified ? "Verified" : "Not verified"}
                </Pill>
                <Pill tone={locationSummary ? "ok" : "warn"}>
                  Location: {locationSummary ? "Added" : "Incomplete"}
                </Pill>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#607089]">General location</div>
                <div className="mt-1 text-sm text-[#334155]">{locationSummary || "Not added yet"}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[24px] border border-[#D7E2F1] bg-white p-4 shadow-sm sm:p-5">
            <form action={updateProfile} className="flex flex-col gap-5">
              <div>
                <div className="text-sm font-extrabold bd-ink">Edit account</div>
                <div className="mt-1 text-sm bd-ink2">
                  Update your display name and general location.
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Display name</label>
                <Input name="name" defaultValue={user.name ?? ""} placeholder="e.g. Jordan" />
              </div>

              <div>
                <label className="text-sm font-medium">Bio (optional)</label>
                <Input name="bio" defaultValue={user.bio ?? ""} placeholder="A short intro (optional)" />
              </div>

              <div className="rounded-2xl border border-[#D7E2F1] bg-[#F8FAFF] p-5">
                <div className="text-sm font-semibold">Location</div>
                <div className="mt-1 text-sm bd-ink2">Use postcode, suburb, and state only.</div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:items-end">
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Postcode</label>
                    <Input name="postcode" defaultValue={user.postcode ?? ""} placeholder="e.g. 4301" />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Suburb</label>
                      <Input name="suburb" defaultValue={user.suburb ?? ""} placeholder="e.g. Redbank Plains" />
                    </div>

                    <div>
                      <label className="text-sm font-medium">State</label>
                      <select
                        name="state"
                        defaultValue={user.state ?? ""}
                        className="mt-1 w-full rounded-lg border border-[#D7E2F1] bg-white px-3 py-2 text-sm bd-ink"
                      >
                        <option value="">Select state</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="bd-btn bd-btn-secondary">
                Save changes
              </Button>

              <div className="text-xs bd-ink2 text-center">
                We only store general area details such as suburb, state, and postcode. No street addresses.
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

