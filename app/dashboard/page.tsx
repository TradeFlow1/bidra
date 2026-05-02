import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import DateTimeText from "@/components/date-time-text";
import { getNotificationCounts } from "@/lib/notifications";
import { Card, Button, Input } from "@/components/ui";

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
      : "rounded-3xl border border-black/10 bg-white p-5 shadow-sm";

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
  const roleSummary = isAdminAccount ? "Admin account" : "Buyer / seller account";
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
  const isFirstRunBuyer = ordersAsBuyerCount === 0 && counts.unreadThreads === 0;
  const isFirstRunSeller = myListingsCount === 0;
  const showFirstRunSetup = isFirstRunBuyer || isFirstRunSeller || !locationSummary;
  const onboardingSteps = [
    { title: "Set up trust basics", body: locationSummary ? "Your general location is added." : "Add suburb, state, and postcode so marketplace context is clear.", href: "#account-details", cta: "Update account" },
    { title: "Start as a buyer", body: "Browse active listings, watch items, and ask clear questions before pickup or postage.", href: "/listings", cta: "Browse listings" },
    { title: "Start as a seller", body: "Create a buyer-ready listing with photos, condition, price, and handover notes.", href: "/sell/new", cta: "Create listing" },
  ];

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Current account role</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">
            {roleSummary}
          </h1>
          <p className="mt-2 max-w-3xl text-sm bd-ink2 sm:text-base">
            Bidra accounts can act as buyers and sellers. Admin accounts also show the trust operations workspace when available.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ordersAsBuyerCount > 0 ? <Pill tone="ok">{buyerModeSummary}</Pill> : <Pill>{buyerModeSummary}</Pill>}
            {myListingsCount > 0 ? <Pill tone="ok">{sellerModeSummary}</Pill> : <Pill>{sellerModeSummary}</Pill>}
            {isAdminAccount ? <Pill tone="ok">Admin workspace enabled</Pill> : null}
          </div>
        </div>

        {showFirstRunSetup ? (
          <section className="rounded-3xl border border-[#D8E1F0] bg-white p-5 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">First-run setup</div>
            <p className="mt-1 text-sm bd-ink2">
              Choose your buyer or seller path without changing account type. Complete the basics once, then use Dashboard to manage listings, orders, messages, and account status.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {onboardingSteps.map((step) => (
                <Link key={step.title} href={step.href} className="rounded-2xl border border-black/10 bg-neutral-50 p-4 shadow-sm hover:bg-black/5">
                  <div className="text-sm font-extrabold text-neutral-950">{step.title}</div>
                  <div className="mt-1 text-sm text-neutral-600">{step.body}</div>
                  <div className="mt-3 text-sm font-extrabold text-[#0F4C81]">{step.cta}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/listings" className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:bg-black/5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Seller listings</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{myListingsCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Manage your listings, drafts, and offers.</div>
          </Link>

          <Link href="/orders" className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:bg-black/5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Buyer orders</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{ordersAsBuyerCount}</div>
            <div className="mt-1 text-sm text-neutral-600">Review purchases and handover follow-ups.</div>
          </Link>

          <Link href="/orders" className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:bg-black/5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Follow-ups</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{counts.actionOrders}</div>
            <div className="mt-1 text-sm text-neutral-600">Messages, sold items, and optional feedback.</div>
          </Link>

          <Link href="/account/restrictions" className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:bg-black/5">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Account status</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">
              {isBlocked || !adult.ok ? "Review" : "Clear"}
            </div>
            <div className="mt-1 text-sm text-neutral-600">Restrictions and account status.</div>
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

        <div id="account-details" className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold bd-ink">Account details</div>
            <div className="mt-1 text-sm bd-ink2">Current visible role: {roleSummary}. Buyer and seller activity is based on your orders, listings, offers, and messages.</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Display name</div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-950">{displayName}</div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">{user.email}</div>
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
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">General location</div>
                <div className="mt-1 text-sm text-neutral-700">{locationSummary || "Not added yet"}</div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <form action={updateProfile} className="flex flex-col gap-5">
              <div>
                <div className="text-sm font-extrabold bd-ink">Edit account</div>
                <div className="mt-1 text-sm bd-ink2">
                  Keep your display name and general location up to date so buyers and sellers have clearer context. This is the first setup step for safer buying and selling.
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

              <div className="rounded-2xl border border-black/10 bg-neutral-50 p-5">
                <div className="text-sm font-semibold">Location</div>
                <div className="mt-1 text-sm bd-ink2">Use postcode, suburb, and state only. Do not enter a street address.</div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                  <div className="sm:col-span-1">
                    <label className="text-sm font-medium">Postcode</label>
                    <Input name="postcode" defaultValue={user.postcode ?? ""} placeholder="e.g. 4301" />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Suburb</label>
                      <Input name="suburb" defaultValue={user.suburb ?? ""} placeholder="e.g. Redbank Plains" />
                    </div>

                    <div>
                      <label className="text-sm font-medium">State</label>
                      <select
                        name="state"
                        defaultValue={user.state ?? ""}
                        className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm bd-ink"
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

              <Button type="submit" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold !text-black text-black shadow-sm hover:bg-black/5">
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
