import Image from "next/image";
import { allowContactDetailsInMessages, maskContactInfo } from "@/lib/message-safety"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"
import { formatAuDateTime } from "@/lib/date"
import SendBox from "./components/send-box"
import InboxBackButton from "./components/inbox-back-button"
import ThreadActions from "./components/thread-actions"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

function displayName(u: any) {
  return u?.username || u?.name || u?.email || "User"
}

export default async function MessagesThreadPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const threadId = String(params?.id || "").trim()

  if (!session?.user?.id) {
    const next = threadId ? `/messages/${encodeURIComponent(threadId)}` : "/messages"
    redirect(`/auth/login?next=${encodeURIComponent(next)}`)
  }

  const gate = await requireAdult(session)
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions")
  if (!gate.ok) redirect("/account")

  const me = session.user.id
  if (!threadId) redirect("/messages")

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        lastMessageAt: true,
        buyerLastReadAt: true,
        sellerLastReadAt: true,
        listing: { select: { id: true, title: true, images: true, photos: true } },
        buyer: { select: { id: true, username: true, name: true, email: true } },
        seller: { select: { id: true, username: true, name: true, email: true } },
      },
    })

    if (!thread) redirect("/messages")

    const isParticipant = thread.buyerId === me || thread.sellerId === me
    if (!isParticipant) redirect("/messages")

    // Read receipts: stamp "last read" when a participant opens the thread
    if (thread.lastMessageAt) {
      const myLastRead = thread.buyerId === me ? thread.buyerLastReadAt : thread.sellerLastReadAt
      const needsStamp =
        !myLastRead || new Date(myLastRead).getTime() < new Date(thread.lastMessageAt).getTime()

      if (needsStamp) {
        await prisma.messageThread.update({
          where: { id: thread.id },
          data: thread.buyerId === me ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
        })
      }
    }

    const other = thread.buyerId === me ? thread.seller : thread.buyer

    const anyListing = thread.listing as unknown as { id?: string | null; title?: string | null; images?: unknown; photos?: unknown } | null
    const imgs =
      (anyListing && Array.isArray(anyListing.images) && anyListing.images.length)
        ? anyListing.images
        : (anyListing && Array.isArray(anyListing.photos) && anyListing.photos.length)
          ? anyListing.photos
          : []
    const thumb = imgs && imgs.length ? String(imgs[0]) : ""

    const messages = await prisma.message.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: { id: true, body: true, createdAt: true, userId: true },
    })

    return (
      <main>
        <div className="bd-container">
          <div className="container">
            <section className="py-10">
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03]">
                      {thumb ? (
                        <Image src={thumb} alt="Listing photo" width={48} height={48} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--bidra-ink-3)]">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-[var(--bidra-ink-2)]">
                      Listing:{" "}
                      <Link
                        className="text-[var(--bidra-ink)] hover:underline underline-offset-4"
                        href={`/listings/${thread.listing.id}`}
                      >
                        {thread.listing.title}
                      </Link>
                    </div>
                  </div>
                  <h1 className="h1">Messages</h1>
                  <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
                    Chat with <span className="font-semibold text-[var(--bidra-ink)]">{displayName(other)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <InboxBackButton />
                  <ThreadActions threadId={thread.id} />
                  <Link
                    href={`/listings/${thread.listing.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[var(--bidra-ink)] hover:bg-white/10"
                  >
                    Back to listing
                  </Link>
                </div>
              </div>

              <div className="mt-6 bd-card p-4 max-h-[55vh] overflow-auto">
                {messages.length ? (
                  <div className="flex flex-col gap-2">
                    {messages.map((m) => (
                      <div key={m.id} className="text-sm">
                        <span className="text-[var(--bidra-ink-2)]">{formatAuDateTime(m.createdAt)} {" · "}</span>
                        <b>{m.userId === me ? "You" : displayName(other)}</b>: {allowContactDetailsInMessages() ? m.body : maskContactInfo(m.body)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--bidra-ink-2)]">No messages yet. Say hello to get started.</div>
                )}
              </div>

              <div className="mt-4 bd-card p-4">
                <SendBox threadId={thread.id} />
                <div className="mt-3 text-xs text-[var(--bidra-ink-2)]">
  Tip: Keep chats about the listing. Be careful sharing contact or payment details — never share passwords or verification codes. When Bidra Pay is live, we’ll recommend paying via your Bidra order page.
</div>
              </div>
            </section>
          </div>
        </div>
      </main>
    )
  } catch (_e) {
    return (
      <main>
        <div className="bd-container">
          <div className="container">
            <section className="py-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)]">Messages</h1>
              <div className="mt-6 rounded-2xl bd-card p-6">
                <div className="text-base font-semibold text-[var(--bidra-ink)]">This conversation is temporarily unavailable.</div>
                <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
                  Please try again shortly.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="bd-btn bd-btn-primary" href="/messages">Back to inbox</Link>
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
