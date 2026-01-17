import Link from "next/link"
import InboxAutoRefresh from "./components/inbox-auto-refresh"
import DateTimeText from "@/components/date-time-text"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function MessagesInboxPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const adult = await requireAdult(session)
  // Messages should NOT dump users into "account restrictions" unless they are explicitly under 18.
  // (Missing DOB / not age-verified should be handled via onboarding, not by breaking Messages.)
  if (!adult.ok && (adult as any).reason === "UNDER_18") redirect("/account/restrictions")

  const me = session.user.id

  const threads = await prisma.messageThread.findMany({
    where: { OR: [{ buyerId: me, buyerDeletedAt: null }, { sellerId: me, sellerDeletedAt: null }] },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      lastMessageAt: true,
      listing: { select: { id: true, title: true } },
      buyerId: true,
      sellerId: true,
      buyer: { select: { username: true, name: true, email: true, id: true } },
      seller: { select: { username: true, name: true, email: true, id: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, userId: true } },
      buyerLastReadAt: true,
      sellerLastReadAt: true,
    },
  })

  const items: (typeof threads[number] & { unread: boolean })[] = threads.map((t) => {
    const myLastRead = t.buyerId === me ? t.buyerLastReadAt : t.sellerLastReadAt
    const lastAt = t.lastMessageAt ? new Date(t.lastMessageAt) : null
    const readAt = myLastRead ? new Date(myLastRead) : null
    const unread = !!(lastAt && (!readAt || readAt.getTime() < lastAt.getTime()))
    return { ...t, unread }
  })

  items.sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })

  return (
    <main>
      <div className="bd-container">
        <div className="container">
          <section className="py-10">
            <InboxAutoRefresh />

            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)]">Messages</h1>
            <p className="mt-2 text-sm text-[var(--bidra-ink-2)]">Private conversations about listings.</p>

            <div className="mt-6 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl bd-card p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
                  <div className="text-base font-semibold">No messages yet.</div>
                  <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
                    When you message a seller (or someone messages you), your chats will show up here.
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/listings"
                      className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10"
                    >
                      Browse listings
                    </Link>
                  </div>
                </div>
              ) : (
                items.map((it) => {
                  const other = me === it.buyerId ? it.seller : it.buyer
                  const otherLabel = other.username || other.name || other.email || "User"
                  const last = it.messages[0]?.body ? it.messages[0].body : "No messages yet.."
                  return (
                    <Link
                      key={it.id}
                      href={`/messages/${it.id}`}
                      className={`block rounded-2xl bd-card p-6 transition hover:bg-black/[0.02] hover:shadow-sm ${
                        it.unread ? "bg-black/[0.03] border-black/15" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-extrabold">{it.listing?.title || "Listing"}</div>
                        <div className="text-xs text-[var(--bidra-ink-2)]">
                          <DateTimeText className="text-xs text-[var(--bidra-ink-2)]" value={it.lastMessageAt} />
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">With: {otherLabel}</div>
                      <div className="mt-2 text-sm text-[var(--bidra-ink-2)] line-clamp-2">{last}</div>
                    </Link>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
