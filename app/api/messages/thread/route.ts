import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required to use Bidra messages." }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: "Your account is not eligible to use Bidra messages." }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const listingId = String(body.listingId || "")
  if (!listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 })

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  })
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  if (listing.status !== "ACTIVE") return NextResponse.json({ error: "Messages can only be started from active listings." }, { status: 400 })

  const me = session.user.id
  if (me === listing.sellerId) {
    return NextResponse.json({ error: "Seller cannot create a buyer thread." }, { status: 400 })
  }

    const existing = await prisma.messageThread.findUnique({
    where: { listingId_buyerId: { listingId, buyerId: me } },
    select: { id: true, buyerDeletedAt: true, createdAt: true },
  })

  const thread = await prisma.messageThread.upsert({
    where: { listingId_buyerId: { listingId, buyerId: me } },
    update: { updatedAt: new Date(), buyerDeletedAt: null },
    create: {
      listingId,
      buyerId: me,
      sellerId: listing.sellerId,
      lastMessageAt: new Date(),
    },
  })

    const eventType = existing ? "MESSAGE_THREAD_OPENED" : "MESSAGE_THREAD_CREATED"
  await prisma.adminEvent.create({
    data: {
      type: eventType,
      userId: me,
      data: {
        listingId,
        threadId: thread.id,
        sellerId: listing.sellerId,
        buyerId: me,
        reopened: !!(existing && existing.buyerDeletedAt),
      },
    },
  })

  return NextResponse.json({ thread })
}
