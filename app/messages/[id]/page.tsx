import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"
import DateTimeText from "@/components/date-time-text"
import { formatAuDateTime } from "@/lib/date"
import SendBox from "./components/send-box"
import InboxBackButton from "./components/inbox-back-button"

export const dynamic = "force-dynamic"

function displayName(u: any) {
  return u?.username || u?.name || u?.email || "User"
}

export default async function MessagesThreadPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const gate = await requireAdult(session)
  if (!gate.ok) redirect("/account/restrictions")

  const me = session.user.id
  const threadId = String(params?.id || "").trim()
  if (!threadId) redirect("/messages")

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      buyerId: true,
      sellerId: true,
      lastMessageAt: true,
      buyerLastReadAt: true,
      sellerLastReadAt: true,
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true,username: true, name: true, email: true } },
      seller: { select: { id: true,username: true, name: true, email: true } },
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
        data:
          thread.buyerId === me
            ? { buyerLastReadAt: new Date() }
            : { sellerLastReadAt: new Date() },
      })
    }
  }
  const other =
    thread.buyerId === me ? thread.seller : thread.buyer

  const messages = await prisma.message.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true,body: true, createdAt: true, userId: true },
  })

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-neutral-600">
            Listing:{" "}
            <Link className="hover:underline" href={`/listings/${thread.listing.id}`}>
              {thread.listing.title}
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="mt-1 text-sm text-neutral-600">
            Chat with <span className="font-medium text-neutral-900">{displayName(other)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <InboxBackButton />
          <Link
            href={`/listings/${thread.listing.id}`}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Back to listing
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 max-h-[55vh] overflow-auto">
        {messages.length ? (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="text-neutral-500">
                  {formatAuDateTime(m.createdAt)} {" · "}
                </span>
                <b>{m.userId === me ? "You" : displayName(other)}</b>: {m.body}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-600">No messages yet.</div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <SendBox threadId={thread.id} />
        <div className="mt-3 text-xs text-neutral-600">
          Tip: Keep personal information minimal until you're confident.
        </div>
      </div>
    </main>
  )
}
