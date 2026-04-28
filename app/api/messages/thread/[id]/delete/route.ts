import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required to use Bidra messages." }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: "Your account is not eligible to use Bidra messages." }, { status: 403 })

  const me = session.user.id
  const id = String(ctx?.params?.id || "").trim()
  if (!id) return NextResponse.json({ error: "Thread id is required" }, { status: 400 })

  const thread = await prisma.messageThread.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true },
  })

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  if (me !== thread.buyerId && me !== thread.sellerId) return NextResponse.json({ error: "You can only access message threads you are part of." }, { status: 403 })

  const data: any = {}
  if (me === thread.buyerId) data.buyerDeletedAt = new Date()
  if (me === thread.sellerId) data.sellerDeletedAt = new Date()

  await prisma.messageThread.update({ where: { id: thread.id }, data })

  // Admin audit trail (for reconstructing messaging actions)
  await prisma.adminEvent.create({
    data: {
      type: "MESSAGE_THREAD_DELETED",
      userId: me,
      data: {
        threadId: thread.id,
        role: me === thread.buyerId ? "BUYER" : "SELLER",
      },
    },
  })

  return NextResponse.json({ ok: true })
}
