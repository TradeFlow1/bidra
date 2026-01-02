import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: adult.reason || "Restricted" }, { status: 403 })

  const me = session.user.id
  const id = ctx.params.id

  const body = await req.json().catch(() => ({}))
  const text = String(body.body || "").trim()
  if (text.length < 1) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 })
  if (text.length > 2000) return NextResponse.json({ error: "Message too long." }, { status: 400 })

  const thread = await prisma.messageThread.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true, listingId: true },
  })
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  if (me !== thread.buyerId && me !== thread.sellerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const msg = await prisma.message.create({
    data: {
      threadId: thread.id,
      listingId: thread.listingId, // keep legacy link too
      userId: me,
      body: text,
    },
    select: { id: true, body: true, createdAt: true, userId: true },
  })

  await prisma.messageThread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date() },
  })

  return NextResponse.json({ message: msg })
}