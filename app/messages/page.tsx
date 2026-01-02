import Link from "next/link"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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
    },
  })

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="mt-2 text-sm text-neutral-600">Private conversations about listings.</p>

      <div className="mt-6 space-y-3">
        {threads.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm text-neutral-600">No messages yet.</div>
        ) : (
          threads.map((t) => {
            const other =
              me === t.buyerId ? t.seller : t.buyer
            const otherLabel = other.username || other.name || other.email || "User"
            const last = t.messages[0]?.body ? t.messages[0].body : "No messages yet."
            return (
              <Link key={t.id} href={`/messages/${t.id}`} className="block rounded-lg border p-4 hover:bg-black/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{t.listing?.title || "Listing"}</div>
                  <div className="text-xs text-neutral-500">{new Date(t.lastMessageAt).toLocaleString()}</div>
                </div>
                <div className="mt-1 text-sm text-neutral-700">With: {otherLabel}</div>
                <div className="mt-2 text-sm text-neutral-600 line-clamp-2">{last}</div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}