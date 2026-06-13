import Image from "next/image";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountAvatarUpload from "@/components/account-avatar-upload";
import AccountNav from "@/components/account-nav";

function formatPrice(cents: number | null | undefined) {
  const value = typeof cents === "number" ? cents : 0;
  return "$" + (value / 100).toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function getListingImage(images: string[] | null | undefined, photos: string[] | null | undefined) {
  const all = [...(images || []), ...(photos || [])];
  const first = all.find((item) => typeof item === "string" && item.trim().length > 0);
  return first || null;
}

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Bidra user";
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BU";
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  const [user, listings, listingCount, soldCount, boughtCount, watchlistCount, activeOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        location: true,
        suburb: true,
        state: true,
        postcode: true,
        createdAt: true,
        emailVerified: true,
        policyBlockedUntil: true,
        policyStrikes: true,
      },
    }),
    prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        buyNowPrice: true,
        status: true,
        images: true,
        photos: true,
        viewCount: true,
        createdAt: true,
        offers: { select: { id: true } },
      },
    }),
    prisma.listing.count({ where: { sellerId: userId } }),
    prisma.order.count({ where: { listing: { sellerId: userId } } }),
    prisma.order.count({ where: { buyerId: userId } }),
    prisma.watchlist.count({ where: { userId } }),
    prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { listing: { sellerId: userId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, status: true, createdAt: true, listing: { select: { title: true } } },
    }),
  ]);

  if (!user) {
    redirect("/auth/login");
  }

  const location = [user.suburb, user.state].filter(Boolean).join(", ") || user.location || "Location not set";
  const locationLabel = location === "Location not set" ? location : "Location: " + location;
  const memberSince = user.createdAt.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
  const avatarInitials = initials(user.name, user.email);

  return (
    <main className="bd-logged-in-page text-[#0F172A]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="hidden md:block">
          <AccountNav active="account" />
        </div>

        <section className="mb-4 md:hidden">
          <div className="overflow-hidden rounded-[30px] border border-[#D7E2F1] bg-gradient-to-br from-white via-[#F8FAFF] to-[#EEF2FF] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4F46E5]">My Bidra</div>
                <h1 className="mt-1 text-4xl font-black tracking-[-0.065em] text-[#07152E]">Account</h1>
                <p className="mt-2 max-w-[260px] text-sm font-semibold leading-6 text-[#475569]">
                  Manage your profile, listings, orders and saved marketplace activity.
                </p>
              </div>
              <Link href="/sell/new" className="flex h-11 shrink-0 items-center rounded-[22px] bg-[#4F46E5] px-4 text-sm font-black text-white !text-white shadow-[0_14px_30px_rgba(79,70,229,0.22)]">
                Sell
              </Link>
            </div>
          </div>
        </section>
        <nav className="mb-8 mt-6 hidden items-center gap-3 text-sm font-semibold text-[#64748B] md:flex">
          <Link href="/" className="text-[#4F46E5]">Home</Link>
          <span>/</span>
          <span>Account</span>
        </nav>

        <section className="overflow-hidden rounded-[30px] border border-[#D7E2F1] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] md:rounded-[32px]">
          <div className="h-28 bg-[linear-gradient(135deg,#DBEAFE_0%,#EEF2FF_45%,#F8FAFC_100%)] sm:h-72">
            <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(79,70,229,0.22),transparent_28%),radial-gradient(circle_at_80%_40%,rgba(14,165,233,0.16),transparent_30%)]" />
          </div>

          <div className="px-4 pb-5 sm:px-10 sm:pb-10">
            <div className="-mt-11 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="flex items-end gap-3 sm:gap-5">
                <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF2FF] text-2xl font-black text-[#4F46E5] shadow-[0_18px_42px_rgba(15,23,42,0.16)] sm:h-40 sm:w-40 sm:text-4xl">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={160} height={160} className="h-full w-full object-cover" /> : avatarInitials}
                </div>
                <div className="min-w-0 pb-1 sm:pb-2">
                  <h1 className="truncate text-3xl font-black tracking-[-0.055em] text-[#07152E] sm:text-5xl">{user.name || user.email || "Bidra account"}</h1>
                  <p className="mt-1 text-sm font-bold text-[#64748B] sm:mt-2 sm:text-base">Member since {memberSince}</p>
                  <p className="mt-1 truncate text-sm font-bold text-[#64748B] sm:mt-3 sm:text-base">{locationLabel}</p>
                </div>
              </div>

              <Link href={`/seller/${user.id}`} className="inline-flex h-12 w-full items-center justify-center rounded-[22px] border border-[#C7D2FE] bg-white px-4 text-sm font-black text-[#3730A3] shadow-sm md:h-12 md:w-auto md:px-6 md:hover:bg-[#EEF2FF]">
                View public profile
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              <StatCard label="Listings" value={listingCount} />
              <StatCard label="Sold" value={soldCount} />
              <StatCard label="Bought" value={boughtCount} />
              <StatCard label="Saved" value={watchlistCount} />
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 md:hidden">
          <MobileActionCard title="Profile" body="Details saved" href="/account" />
          <MobileActionCard title="Listings" body={`${listingCount} active items`} href="#listings" />
          <MobileActionCard title="Activity" body={`${activeOrders.length} open orders`} href="#activity" />
          <MobileActionCard title="Status" body={user.policyBlockedUntil ? "Restricted" : "Clear account"} href="#restrictions" />
        </section>

        <div className="mt-10 hidden border-b border-[#E2E8F0] md:block">
          <div className="flex gap-10 text-base font-black">
            <a href="#listings" className="border-b-2 border-[#4F46E5] pb-4 text-[#4F46E5]">Listings</a>
            <a href="#account" className="pb-4 text-[#0F172A]">Account</a>
            <a href="#activity" className="pb-4 text-[#0F172A]">Activity</a>
            <a href="#restrictions" className="pb-4 text-[#0F172A]">Restrictions</a>
          </div>
        </div>

        <section id="listings" className="mt-5 md:mt-10">
          <div className="mb-4 flex items-center justify-between gap-4 md:mb-6">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07152E]">Your listings</h2>
            <BidraButton href="/sell/new">Sell an item</BidraButton>
          </div>

          {listings.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-6 lg:grid-cols-5">
              {listings.map((listing, index) => {
                if (index >= 4) {
                  return null;
                }

                const image = getListingImage(listing.images, listing.photos);
                const price = listing.buyNowPrice ?? listing.price;

                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="group overflow-hidden rounded-2xl border border-[#DCE5F2] bg-white shadow-sm transition">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC] md:aspect-square">
                      {image ? <Image src={image} alt="" fill className="object-cover transition duration-300" /> : null}
                    </div>
                    <div className="p-3 md:p-5">
                      <h3 className="line-clamp-2 text-sm font-black text-[#08112F] md:text-lg">{listing.title}</h3>
                      <p className="mt-1 text-sm font-black text-[#0F172A] md:mt-2 md:text-base">{formatPrice(price)}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#64748B] md:mt-2 md:text-xs">{listing.status}</p>
                      <p className="mt-1 text-[10px] font-black text-[#3730A3] md:mt-2 md:text-xs">{listing.viewCount.toLocaleString("en-AU")} views{listing.offers.length > 0 ? " - " + (listing.offers.length === 1 ? "1 offer" : listing.offers.length + " offers") : ""}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#C7D2FE] bg-[#F8FAFC] p-8 text-center">
              <h3 className="text-xl font-black">No listings yet</h3>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">Create your first listing when you are ready to sell.</p>
            </div>
          )}
        </section>

        <section id="account" className="mt-8 hidden gap-3 md:mt-14 md:grid md:gap-6 lg:grid-cols-3">
          <InfoCard title="Profile details" body={`${user.email || "No email set"} - ${location}`} href="/account" label="Manage account" />
          <InfoCard title="Messages" body="Keep buyer and seller conversations in one place." href="/messages" label="Open messages" />
          <InfoCard title="Watchlist" body={`${watchlistCount} saved item${watchlistCount === 1 ? "" : "s"}.`} href="/watchlist" label="View watchlist" />
        </section>

        <section id="activity" className="mt-8 md:mt-14">
          <h2 className="text-xl font-black tracking-tight md:text-2xl">Recent activity</h2>
          <div className="mt-3 divide-y divide-[#E2E8F0] overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-sm md:mt-5">
            {activeOrders.length ? activeOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-4 p-4 md:p-5 md:hover:bg-[#EEF2FF]">
                <div>
                  <div className="font-black">{order.listing.title}</div>
                  <div className="mt-1 text-sm font-semibold text-[#64748B]">Order status: {order.status}</div>
                </div>
                <span className="text-sm font-black text-[#4F46E5]">View</span>
              </Link>
            )) : (
              <div className="p-5 text-sm font-semibold text-[#64748B]">No recent orders yet.</div>
            )}
          </div>
        </section>

        <section id="edit-account" className="mt-8 hidden rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:mt-14 md:block md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Manage account</h2>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">Edit your profile details, marketplace location and profile picture.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:mt-6 md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <AccountAvatarUpload avatarUrl={user.avatarUrl} fallback={avatarInitials} />

            <form action="/api/account/update" method="post" className="grid gap-3 md:gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black">Display name</span>
                  <input name="name" defaultValue={user.name || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Your name" />
                </label>

                <label className="block">
                  <span className="text-sm font-black">Phone</span>
                  <input name="phone" defaultValue={user.phone || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Mobile number" />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-black">Bio</span>
                <textarea name="bio" defaultValue={user.bio || ""} className="mt-2 min-h-28 w-full rounded-2xl border border-[#CBD5E1] px-4 py-3 text-sm font-semibold" placeholder="Tell buyers and sellers a little about you." />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-black">Postcode</span>
                  <input name="postcode" defaultValue={user.postcode || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="4000" />
                </label>

                <label className="block">
                  <span className="text-sm font-black">Suburb</span>
                  <input name="suburb" defaultValue={user.suburb || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] px-4 text-sm font-semibold" placeholder="Brisbane City" />
                </label>

                <label className="block">
                  <span className="text-sm font-black">State</span>
                  <select name="state" defaultValue={user.state || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold hover:bg-[#EEF2FF]">
                    <option value="">Select</option>
                    <option value="QLD">QLD</option>
                    <option value="NSW">NSW</option>
                    <option value="VIC">VIC</option>
                    <option value="SA">SA</option>
                    <option value="WA">WA</option>
                    <option value="TAS">TAS</option>
                    <option value="ACT">ACT</option>
                    <option value="NT">NT</option>
                  </select>
                </label>
              </div>

              <button type="submit" className="h-12 rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white hover:bg-[#4338CA] disabled:!text-white">
                Save account details
              </button>
            </form>
          </div>
        </section>
        <section id="restrictions" className="mt-6 rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm md:mt-14 md:p-6">
          <h2 className="text-xl font-black tracking-tight md:text-2xl">Account status</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:mt-4 md:gap-4">
            <StatusPill label="Email" value={user.emailVerified ? "Verified" : "Needs verification"} good={Boolean(user.emailVerified)} />
            <StatusPill
              label="Restrictions"
              value={user.policyBlockedUntil ? "Restricted" : user.policyStrikes > 0 ? `${user.policyStrikes} strike${user.policyStrikes === 1 ? "" : "s"}` : "No active restrictions"}
              good={!user.policyBlockedUntil && user.policyStrikes === 0}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function MobileActionCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link href={href} className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] active:scale-[0.99]">
      <div className="text-base font-black text-[#3730A3]">{title}</div>
      <div className="mt-1 text-xs font-bold leading-5 text-[#64748B]">{body}</div>
    </Link>
  );
}
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-[#DCE5F2] bg-white/90 p-3 text-center shadow-[0_12px_28px_rgba(15,23,42,0.07)] ring-1 ring-[#EEF2FF] md:p-6">
      <div className="text-2xl font-black tracking-[-0.04em] text-[#07152E] md:text-4xl">{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#64748B] md:text-sm">{label}</div>
    </div>
  );
}
function InfoCard({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <Link href={href} className="rounded-[24px] border border-[#DCE5F2] bg-white p-4 shadow-sm transition md:p-6">
      <h3 className="text-base font-black md:text-lg">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B] md:mt-2 md:min-h-12">{body}</p>
      <div className="mt-3 text-sm font-black text-[#4F46E5] md:mt-4">{label}</div>
    </Link>
  );
}

function StatusPill({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-2xl border border-[#DCE5F2] bg-[#F8FAFC] p-4 md:p-5">
      <div className="text-sm font-black text-[#64748B]">{label}</div>
      <div className={good ? "mt-2 text-lg font-black text-[#15803D]" : "mt-2 text-lg font-black text-[#B45309]"}>{value}</div>
    </div>
  );
}
