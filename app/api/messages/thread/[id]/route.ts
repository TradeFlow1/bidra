import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: adult.reason || "Restricted" }, { status: 403 })

  const me = session.user.id
  const id = ctx.params.id

  const thread = await prisma.messageThread.findUnique({
    where: { id },
    select: {
      id: true,
      listingId: true,
      buyerId: true,
      buyerDeletedAt: true,
      sellerId: true,
      sellerDeletedAt: true,
      lastMessageAt: true,
      listing: { select: { id: true, title: true } },
    },
  })

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  if (me !== thread.buyerId && me !== thread.sellerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const iDeleted = (me === thread.buyerId && thread.buyerDeletedAt) || (me === thread.sellerId && thread.sellerDeletedAt)
  if (iDeleted) return NextResponse.json({ error: "Thread not found" }, { status: 404 })

  const messages = await prisma.message.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
    take: 300,
    select: { id: true, body: true, createdAt: true, userId: true },
  })

  return NextResponse.json({ thread, messages })
}
