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
  if (!adult.ok) redirect("/account/restrictions")

  const me = session.user.id

  const threads = await prisma.messageThread.findMany({
    where: { OR: [{ buyerId: me }, { sellerId: me }] },
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

            <h1 className="text-2xl font-semibold">Messages</h1>
            <p className="mt-2 text-sm text-neutral-600">Private conversations about listings.</p>

            <div className="mt-6 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border bg-white p-6">
                  <div className="text-base font-semibold">No messages yet</div>
                  <div className="mt-1 text-sm text-neutral-600">
                    When you message a seller (or someone messages you), your chats will show up here.
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/listings"
                      className="inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                    >
                      Browse listings
                    </Link>
                  </div>
                </div>
              ) : (
                items.map((it) => {
                  const other = me === it.buyerId ? it.seller : it.buyer
                  const otherLabel = other.username || other.name || other.email || "User"
                  const last = it.messages[0]?.body ? it.messages[0].body : "No messages yet."
                  return (
                    <Link
                      key={it.id}
                      href={`/messages/${it.id}`}
                      className={`block rounded-lg border p-4 hover:bg-black/5 ${
                        it.unread ? "bg-blue-50/60 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{it.listing?.title || "Listing"}</div>
                        <div className="text-xs text-neutral-500">
                          <DateTimeText className="text-xs text-neutral-500" value={it.lastMessageAt} />
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-neutral-700">With: {otherLabel}</div>
                      <div className="mt-2 text-sm text-neutral-600 line-clamp-2">{last}</div>
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
