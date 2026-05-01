import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdult } from "@/lib/require-adult"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required to use Bidra messages." }, { status: 401 })

  const adult = await requireAdult(session)
  if (!adult.ok) return NextResponse.json({ error: "Your account is not eligible to use Bidra messages." }, { status: 403 })

  const me = session.user.id
  const id = String(ctx?.params?.id || "").trim()
  if (!id) return NextResponse.json({ error: "Thread id is required" }, { status: 400 })

  const body = await req.json().catch((): unknown => ({}))
  const userDetails = String((body as unknown as { details?: unknown } | null | undefined)?.details || "").trim()
  if (!userDetails) return NextResponse.json({ error: "Details are required" }, { status: 400 })
  if (userDetails.length > 2000) return NextResponse.json({ error: "Details too long" }, { status: 400 })

  const thread = await prisma.messageThread.findUnique({
    where: { id },
    select: { id: true, buyerId: true, sellerId: true, listingId: true },
  })

  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  if (me !== thread.buyerId && me !== thread.sellerId) return NextResponse.json({ error: "You can only access message threads you are part of." }, { status: 403 })

  const recent = await prisma.message.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { createdAt: true, userId: true, body: true },
  })

  const recentText = recent
    .reverse()
    .map((m) => `${new Date(m.createdAt).toISOString()} ${m.userId}: ${String(m.body || "").slice(0, 240)}`)
    .join("\n")

  const details = [
    "MESSAGE_REPORT",
    `ThreadId: ${thread.id}`,
    `ListingId: ${thread.listingId}`,
    `ReporterId: ${me}`,
    "",
    "User details:",
    userDetails,
    "",
    "Recent messages captured for moderation evidence (last 10):",
    recentText || "(none)",
  ].join("\n")

  const report = await prisma.report.create({
    data: {
      listingId: thread.listingId,
      reporterId: me,
      reason: "MESSAGE",
      details,
    },
    select: { id: true },
  })

  // Admin audit trail for reconstructing message-report evidence and triage actions
  await prisma.adminEvent.create({
    data: {
      type: "MESSAGE_THREAD_REPORTED",
      userId: me,
      data: {
        threadId: thread.id,
        listingId: thread.listingId,
        reportId: report.id,
        detailsLen: userDetails.length,
      },
    },
  })

  return NextResponse.json({ ok: true, reportId: report.id })
}
