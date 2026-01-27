import Image from "next/image";
import { maskContactInfo } from "@/lib/message-safety"
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
  if (!session?.user?.id) redirect("/auth/login?next=/messages")

  const gate = await requireAdult(session)
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions")
  if (!gate.ok) redirect("/account")

  const me = session.user.id

  try {
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [
          { buyerId: me, buyerDeletedAt: null },
          { sellerId: me, sellerDeletedAt: null },
        ],
      },
      orderBy: { lastMessageAt: "desc" },
      take: 100,
      select: {
        id: true,
        lastMessageAt: true,
        listing: { select: { id: true, title: true, images: true, photos: true } },
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

        const unreadCount = items.filter((i) => i.unread).length

    items.sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1
      const aT = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bT = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bT - aT
    })

    return (
      <main>
        <div className="bd-card mt-4">
  <div className="text-sm bd-ink">
    <span className="font-semibold">Safety tip:</span>{" "}
    Do not share your phone number or email address in messages. Keep communication on Bidra so there's a record if something goes wrong.
  </div>
</div>
<div className="bd-container">
          <div className="container">
            <section className="py-10">
              <InboxAutoRefresh />

              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)]">Messages</h1>
              <p className="mt-2 text-sm text-[var(--bidra-ink-2)]">Private conversations about listings.</p>

{unreadCount > 0 ? (
  <div className="mt-4 rounded-2xl border border-black/10 bg-[var(--bidra-blue)]/10 px-4 py-3 text-sm text-[var(--bidra-ink)]">
    <b>Unread messages:</b> You have <b>{unreadCount}</b> unread {unreadCount === 1 ? "conversation" : "conversations"}.
  </div>
) : null}

              <div className="mt-6 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-2xl bd-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
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
                    const last = it.messages[0]?.body ? maskContactInfo(it.messages[0].body) : "No messages yet."

                    const anyListing: any = it.listing as any
                    const imgs =
                      (anyListing && Array.isArray(anyListing.images) && anyListing.images.length)
                        ? anyListing.images
                        : (anyListing && Array.isArray(anyListing.photos) && anyListing.photos.length)
                          ? anyListing.photos
                          : []
                    const thumb = imgs && imgs.length ? String(imgs[0]) : ""

                    return (
                      <Link
                        key={it.id}
                        href={`/messages/${it.id}`}
                        className={`block rounded-2xl bd-card p-6 transition hover:bg-black/[0.02] hover:shadow-sm ${
                          it.unread ? "bg-black/[0.03] border-black/15" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03]">
                            {thumb ? (
                              <Image src={thumb} alt="Listing photo" width={56} height={56} className="h-full w-full object-cover" unoptimized />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--bidra-ink-3)]">
                                No photo
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0 font-extrabold truncate">{it.listing?.title || "Listing"}</div>
                              <div className="shrink-0 text-xs text-[var(--bidra-ink-2)]">
                                <DateTimeText className="text-xs text-[var(--bidra-ink-2)]" value={it.lastMessageAt} />
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-[var(--bidra-ink-2)] truncate">With: {otherLabel}</div>
                            <div className="mt-2 text-sm text-[var(--bidra-ink-2)] line-clamp-2">{last}</div>
                          </div>
                        </div>
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
  } catch (_e) {
    return (
      <main>
        <div className="bd-card mt-4">
  <div className="text-sm bd-ink">
    <span className="font-semibold">Safety tip:</span>{" "}
    Do not share your phone number or email address in messages. Keep communication on Bidra so there's a record if something goes wrong.
  </div>
</div>
<div className="bd-container">
          <div className="container">
            <section className="py-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)]">Messages</h1>
              <div className="mt-6 rounded-2xl bd-card p-6">
                <div className="text-base font-semibold text-[var(--bidra-ink)]">Messages are temporarily unavailable.</div>
                <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
                  Please try again shortly. If this keeps happening, use Support.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="bd-btn bd-btn-primary" href="/dashboard">Dashboard</Link>
                  <Link className="bd-btn bd-btn-primary" href="/support">Support</Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  }
}
