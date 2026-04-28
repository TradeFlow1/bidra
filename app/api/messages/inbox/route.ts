import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required to use Bidra messages." }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: "Your account is not eligible to use Bidra messages." }, { status: 403 })

  const me = session.user.id

  const threads = await prisma.messageThread.findMany({
    where: { OR: [{ buyerId: me, buyerDeletedAt: null }, { sellerId: me, sellerDeletedAt: null }] },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      listingId: true,
      buyerId: true,
      sellerId: true,
      lastMessageAt: true,
      listing: { select: { id: true, title: true } },
      buyer: { select: { id: true, username: true, name: true, email: true } },
      seller: { select: { id: true, username: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { body: true, createdAt: true, userId: true } },
    },
  })

  return NextResponse.json({ threads })
}
