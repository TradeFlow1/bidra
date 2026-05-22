import Image from "next/image";
import { BidraButton } from "@/components/bidra/ui/BidraButton";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountAvatarUpload from "@/components/account-avatar-upload";

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
        createdAt: true,
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
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1320px] px-8 py-10">
        <nav className="mb-8 flex items-center gap-3 text-sm font-semibold text-[#64748B]">
          <Link href="/" className="text-[#4F46E5]">Home</Link>
          <span>/</span>
          <span>Account</span>
        </nav>

        <section className="overflow-hidden rounded-[28px] border border-[#D7E2F1] bg-white shadow-sm">
          <div className="h-64 bg-[linear-gradient(135deg,#DBEAFE_0%,#EEF2FF_45%,#F8FAFC_100%)] sm:h-72">
            <div className="h-full w-full bg-[radial-gradient(circle_at_25%_20%,rgba(79,70,229,0.22),transparent_28%),radial-gradient(circle_at_80%_40%,rgba(14,165,233,0.16),transparent_30%)]" />
          </div>

          <div className="px-8 pb-10 sm:px-10">
            <div className="-mt-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#EEF2FF] text-4xl font-black text-[#4F46E5] shadow-lg">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={160} height={160} className="h-full w-full object-cover" /> : avatarInitials}
                </div>
                <div className="pb-2">
                  <h1 className="text-5xl font-black tracking-tight">{user.name || user.email || "Bidra account"}</h1>
                  <p className="mt-2 text-base font-semibold text-[#64748B]">Member since {memberSince}</p>
                  <p className="mt-3 text-base font-semibold text-[#64748B]">{locationLabel}</p>
                </div>
              </div>

              <Link href={`/seller/${user.id}`} className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#C7D2FE] bg-white px-6 text-sm font-black text-[#4F46E5] hover:bg-[#F5F3FF]">
                View public profile
              </Link>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-4">
              <StatCard label="Listings" value={listingCount} />
              <StatCard label="Sold" value={soldCount} />
              <StatCard label="Bought" value={boughtCount} />
              <StatCard label="Saved" value={watchlistCount} />
            </div>
          </div>
        </section>

        <div className="mt-10 border-b border-[#E2E8F0]">
          <div className="flex gap-10 text-base font-black">
            <a href="#listings" className="border-b-2 border-[#4F46E5] pb-4 text-[#4F46E5]">Listings</a>
            <a href="#account" className="pb-4 text-[#0F172A]">Account</a>
            <a href="#activity" className="pb-4 text-[#0F172A]">Activity</a>
            <a href="#restrictions" className="pb-4 text-[#0F172A]">Restrictions</a>
          </div>
        </div>

        <section id="listings" className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight">Your listings</h2>
            <BidraButton href="/sell/new">Sell an item</BidraButton>
          </div>

          {listings.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {listings.map((listing) => {
                const image = getListingImage(listing.images, listing.photos);
                const price = listing.buyNowPrice ?? listing.price;

                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`} className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm hover:border-[#C7D2FE]">
                    <div className="relative aspect-square bg-[#F1F5F9]">
                      {image ? <Image src={image} alt="" fill className="object-cover" /> : null}
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-2 text-lg font-black">{listing.title}</h3>
                      <p className="mt-2 text-base font-black text-[#0F172A]">{formatPrice(price)}</p>
                      <p className="mt-2 text-xs font-semibold text-[#64748B]">{listing.status}</p>
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

        <section id="account" className="mt-14 grid gap-6 lg:grid-cols-3">
          <InfoCard title="Profile details" body={`${user.email || "No email set"} - ${location}`} href="/account" label="Manage account" />
          <InfoCard title="Messages" body="Keep buyer and seller conversations in one place." href="/messages" label="Open messages" />
          <InfoCard title="Watchlist" body={`${watchlistCount} saved item${watchlistCount === 1 ? "" : "s"}.`} href="/watchlist" label="View watchlist" />
        </section>

        <section id="activity" className="mt-14">
          <h2 className="text-2xl font-black tracking-tight">Recent activity</h2>
          <div className="mt-5 divide-y divide-[#E2E8F0] overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-sm">
            {activeOrders.length ? activeOrders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between gap-4 p-5 hover:bg-[#F5F3FF]">
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

        <section id="edit-account" className="mt-14 rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Manage account</h2>
              <p className="mt-2 text-sm font-semibold text-[#64748B]">Edit your profile details, marketplace location and profile picture.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <AccountAvatarUpload avatarUrl={user.avatarUrl} fallback={avatarInitials} />

            <form action="/api/account/update" method="post" className="grid gap-4">
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
                  <select name="state" defaultValue={user.state || ""} className="mt-2 h-12 w-full rounded-2xl border border-[#CBD5E1] bg-white px-4 text-sm font-semibold">
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

              <button type="submit" className="h-12 rounded-2xl bg-[#4F46E5] px-6 text-sm font-black !text-white hover:bg-[#4338CA]">
                Save account details
              </button>
            </form>
          </div>
        </section>
        <section id="restrictions" className="mt-14 rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight">Account status</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-sm">
      <div className="text-4xl font-black">{value}</div>
      <div className="mt-1 text-sm font-semibold text-[#64748B]">{label}</div>
    </div>
  );
}

function InfoCard({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <Link href={href} className="rounded-[24px] border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#C7D2FE] hover:bg-[#F5F3FF]">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-[#64748B]">{body}</p>
      <div className="mt-4 text-sm font-black text-[#4F46E5]">{label}</div>
    </Link>
  );
}

function StatusPill({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
      <div className="text-sm font-black text-[#64748B]">{label}</div>
      <div className={good ? "mt-2 text-lg font-black text-[#15803D]" : "mt-2 text-lg font-black text-[#B45309]"}>{value}</div>
    </div>
  );
}
