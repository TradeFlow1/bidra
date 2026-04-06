#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $PSCommandPath
if ([string]::IsNullOrWhiteSpace($scriptRoot)) {
    throw 'This script must be run from a .ps1 file, not pasted into the console.'
}

$repoRoot = Split-Path -Parent $scriptRoot
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package.json'))) {
    throw "Repo root guard failed. Expected package.json at: $repoRoot"
}
Set-Location $repoRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $enc)
}

$messagesPagePath = Join-Path $repoRoot 'app\messages\page.tsx'
$messagesThreadPath = Join-Path $repoRoot 'app\messages\[id]\page.tsx'
$helpPagePath = Join-Path $repoRoot 'app\help\page.tsx'
$howItWorksPath = Join-Path $repoRoot 'app\how-it-works\page.tsx'
$supportPagePath = Join-Path $repoRoot 'app\support\page.tsx'
$payConfirmPath = Join-Path $repoRoot 'app\api\orders\[id]\pay\confirm\route.ts'

$messagesPage = @'
import Image from "next/image";
import { allowContactDetailsInMessages, maskContactInfo } from "@/lib/message-safety"
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
            Do not share your phone number or email address in messages. Keep communication on Bidra so there is a record if something goes wrong.
          </div>
        </div>
        <div className="bd-container">
          <div className="container">
            <section className="py-10">
              <InboxAutoRefresh />

              <h1 className="text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)]">Messages</h1>
              <p className="mt-2 text-sm text-[var(--bidra-ink-2)]">Use messages for clarification only. Scheduling and order steps are controlled in the order flow.</p>

              {unreadCount > 0 ? (
                <div className="mt-4 rounded-2xl border border-black/10 bg-[var(--bidra-blue)]/10 px-4 py-3 text-sm text-[var(--bidra-ink)]">
                  <b>Unread messages:</b> You have <b>{unreadCount}</b> unread {unreadCount === 1 ? "conversation" : "conversations"}.
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl border border-black/10 bg-white/5 px-4 py-3 text-sm text-[var(--bidra-ink-2)]">
                Messages help with clarification about the item, condition, access, and pickup context. They do not override the order or pickup flow.
              </div>

              <div className="mt-6 space-y-3">
                {items.length === 0 ? (
                  <div className="rounded-2xl bd-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
                    <div className="text-base font-semibold">No messages yet.</div>
                    <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
                      When you contact someone about a listing, your clarification threads will show up here.
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
                    const last = it.messages[0]?.body ? (allowContactDetailsInMessages() ? it.messages[0].body : maskContactInfo(it.messages[0].body)) : "No messages yet."

                    const anyListing = it.listing as unknown as { id?: string | null; title?: string | null; images?: unknown; photos?: unknown } | null
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
                          it.unread ? "bg-[var(--bidra-blue)]/10 border-[var(--bidra-blue)]/30 ring-1 ring-[var(--bidra-blue)]/10" : ""
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
                              <div className={"min-w-0 truncate " + (it.unread ? "font-extrabold text-[var(--bidra-ink)]" : "font-bold text-[var(--bidra-ink)]")}>{it.listing?.title || "Listing"}</div>
                              <div className="shrink-0 flex items-center gap-2">
                                {it.unread ? (
                                  <span className="inline-flex items-center rounded-full border border-[var(--bidra-blue)]/30 bg-[var(--bidra-blue)]/15 px-2 py-0.5 text-[10px] font-extrabold text-[var(--bidra-ink)]">
                                    Unread
                                  </span>
                                ) : null}
                                <DateTimeText className="text-xs text-[var(--bidra-ink-2)]" value={it.lastMessageAt} />
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-[var(--bidra-ink-2)] truncate">With: {otherLabel}</div>
                            <div className={"mt-2 text-sm line-clamp-2 " + (it.unread ? "text-[var(--bidra-ink)] font-semibold" : "text-[var(--bidra-ink-2)]")}>{last}</div>
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
            Do not share your phone number or email address in messages. Keep communication on Bidra so there is a record if something goes wrong.
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
'@

$messagesThread = @'
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

    const otherLastReadAt = (thread.buyerId === me ? thread.sellerLastReadAt : thread.buyerLastReadAt) || null

    const myMessages = messages.filter((x) => x.userId === me)
    const lastMyMessageAt = myMessages.length ? myMessages[myMessages.length - 1].createdAt : null
    const lastMyMessageId = myMessages.length ? myMessages[myMessages.length - 1].id : null

    const seenLastMyMessage =
      !!(lastMyMessageAt && otherLastReadAt && new Date(otherLastReadAt).getTime() >= new Date(lastMyMessageAt).getTime())

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
                    Clarification thread with <span className="font-semibold text-[var(--bidra-ink)]">{displayName(other)}</span>
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

              <div className="mt-4 rounded-2xl border border-black/10 bg-white/5 px-4 py-3 text-sm text-[var(--bidra-ink-2)]">
                Use messages only for clarification about the item, access, or pickup context. Scheduling and order decisions stay in the order flow.
              </div>

              <div className="mt-6 bd-card p-4 max-h-[60vh] overflow-auto">
                {messages.length ? (
                  <div className="flex flex-col gap-3">
                    {messages.map((m) => {
                      const mine = m.userId === me
                      const body = allowContactDetailsInMessages() ? m.body : maskContactInfo(m.body)
                      const isLastMine = mine && lastMyMessageId && m.id === lastMyMessageId

                      return (
                        <div key={m.id} className={"flex " + (mine ? "justify-end" : "justify-start")}>
                          <div className={"max-w-[85%] sm:max-w-[70%]"}>
                            <div
                              className={
                                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed border " +
                                (mine
                                  ? "bg-[var(--bidra-ink)] text-white border-black/10"
                                  : "bg-white/5 text-[var(--bidra-ink)] border-white/10")
                              }
                            >
                              {body}
                            </div>

                            <div className={"mt-1 flex items-center gap-2 text-[11px] " + (mine ? "justify-end" : "justify-start")}>
                              <span className="text-[var(--bidra-ink-2)]">{formatAuDateTime(m.createdAt)}</span>

                              {isLastMine ? (
                                <span className="text-[var(--bidra-ink-2)]">{seenLastMyMessage ? "Seen" : "Sent"}</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-[var(--bidra-ink-2)]">No messages yet. Use this space for clarification only.</div>
                )}
              </div>

              <div className="mt-4 bd-card p-4">
                <SendBox threadId={thread.id} />
                <div className="mt-3 text-xs text-[var(--bidra-ink-2)]">
                  Tip: Keep messages about the listing. Use Messages for clarification only. Never share passwords or verification codes, and follow the order and pickup flow shown in-app.
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
'@

$helpPage = @'
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 30 }}>Help</h1>
        <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.8 }}>
          Quick guidance for using Bidra. If you cannot find what you need, contact support.
        </p>
      </header>

      <section style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>How it works</h2>
        <ol style={{ marginTop: 8, lineHeight: 1.7 }}>
          <li>Create a listing.</li>
          <li>Connect locally and keep messages focused on clarification only.</li>
          <li>After a sale, pickup is scheduled in-app. Bidra records outcomes and enforces reliability through the order flow.</li>
          <li>Complete the order after handover and leave feedback.</li>
        </ol>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2>FAQ</h2>
        <ul style={{ lineHeight: 1.7, opacity: 0.85 }}>
          <li>How do offers work?</li>
          <li>What items are prohibited?</li>
          <li>How do I report a problem?</li>
          <li>How do I update my location?</li>
        </ul>
      </section>

      <p style={{ marginTop: 24 }}>
        <Link href="/">← Back to home</Link>
      </p>
    </main>
  );
}
'@

$howItWorks = @'
export default function HowItWorksPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">How Bidra works</h1>
      <p className="mt-3 text-base text-black/70">
        Bidra is an Australian marketplace where people list items and connect directly.
        We are the platform — we are not the seller, and we do not automatically award a winner.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">1) Create an account</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>18+ only:</strong> accounts are for adults. Under 18s can browse publicly but cannot transact or message.</li>
          <li>Set your <strong>location</strong> (suburb, state, postcode) so buyers see realistic pickup context.</li>
          <li>Keep your profile accurate — it helps trust and reduces disputes.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">2) List an item</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Add a clear title, honest description, condition, and photos that show the actual item.</li>
          <li>Choose the sale format that matches how you want to sell:</li>
        </ul>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Buy Now (binding)</h3>
            <p className="mt-2 text-sm text-black/70">
              You set a fixed price. When a buyer clicks Buy Now, it becomes a binding sale.
              This is the fastest path to a completed local handover.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
              <li>Seller pre-authorises the sale by listing with Buy Now enabled.</li>
              <li>Buyer commits to complete the purchase under Bidra's rules.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-black/10 p-4">
            <h3 className="font-semibold">Timed Offers (seller chooses)</h3>
            <p className="mt-2 text-sm text-black/70">
              Buyers place offers during the listing period. When the timer ends, the seller can choose what to do.
              A sale only forms if the seller explicitly accepts an offer.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-black/70 space-y-1">
              <li>No automatic winner. Seller controls acceptance.</li>
              <li>Seller may decline or relist.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">3) Messages and pickup scheduling</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use Messages only to clarify item details, condition, access, or pickup context. Pickup timing is scheduled in-app.</li>
          <li>For safety, keep communication respectful and clear. If anything feels off, report it.</li>
          <li>Never send ID photos or sensitive information you would not want exposed.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">4) Completing the order</h2>
        <p className="mt-3 text-black/75">
          For Buy Now purchases, the sale becomes binding first and pickup is then scheduled in-app. Follow the order flow shown on screen. After the in-person handover is finished, complete the order inside Bidra.
        </p>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>There is no in-app payment step in Bidra V2.</li>
          <li>After handover, mark the order complete inside Bidra.</li>
          <li>Leave feedback to help the community make better decisions.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">5) Disputes, reporting, and safety</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>If a listing breaks rules, use <strong>Report</strong> on the listing or message thread.</li>
          <li>If something goes wrong, keep records (screenshots, messages, photos) and contact Support.</li>
          <li>Bidra may remove listings, restrict accounts, or investigate patterns of abuse to keep the marketplace safe.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Important notes</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li><strong>Bidra is the platform only</strong> — items are sold by users, and we are not an auctioneer, escrow holder, shipping provider, or payment provider.</li>
          <li>Use the in-app order flow and keep records for smoother resolution if something goes wrong.</li>
          <li>Fees (if any) are shown before you confirm actions. See <a className="underline" href="/legal/fees">Fees</a>.</li>
          <li>Listings must follow our rules. Prohibited items are blocked. See <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.</li>
        </ul>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Want the fine print? Read our <a className="underline" href="/legal/terms">Terms</a>,{" "}
          <a className="underline" href="/legal/privacy">Privacy</a>,{" "}
          <a className="underline" href="/legal/fees">Fees</a>, and{" "}
          <a className="underline" href="/legal/prohibited-items">Prohibited items</a>.
        </p>
      </section>
    </main>
  );
}
'@

$supportPage = @'
export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Support & Safety</h1>
      <p className="mt-3 text-base text-black/70">
        Bidra is a community marketplace. We work hard to keep it safe, but buyers and sellers should always use
        common sense and follow best-practice safety steps.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">If you need help</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use <strong>Report</strong> on listings and message threads for rule-breaking content or behaviour.</li>
          <li>For account and order issues, contact us via <a className="underline" href="/contact">Contact</a>.</li>
          <li>Include links, screenshots, and order/listing IDs so we can investigate quickly.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Safe buying (recommended)</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Meet in a public place for pickups. Bring a friend if possible.</li>
          <li>Inspect items before handing over money, especially electronics, bikes, and high-value goods.</li>
          <li>Be cautious of unrealistic prices, urgency pressure, or requests to move fast off-platform.</li>
          <li>Pickup is scheduled in-app. No-shows and repeat reschedules affect reliability.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Safe selling (recommended)</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Use clear photos and honest descriptions to reduce disputes.</li>
          <li>Do not rely on screenshots or off-platform claims. Follow the order status and in-app pickup flow.</li>
          <li>If something changes, request a reschedule in-app. Messages are for clarification only.</li>
          <li>Never share your passwords, one-time codes, or other sensitive login details.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Scams and red flags</h2>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Someone asks you to continue the transaction outside Bidra to avoid fees or records.</li>
          <li>Someone offers overpayment with a request to refund the difference.</li>
          <li>Someone refuses pickup inspection or pressures you to ignore the in-app pickup flow.</li>
          <li>Someone pressures you to communicate only by SMS or WhatsApp before agreeing key terms.</li>
        </ul>
        <p className="mt-3 text-sm text-black/60">
          If you see these patterns, stop and report. We investigate abusive behaviour and may restrict accounts.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Disputes</h2>
        <p className="mt-3 text-black/75">
          Most issues are resolved between buyer and seller. If you cannot resolve it, contact Support with your order
          ID, listing link, and evidence. Bidra may take platform actions such as removing listings or restricting
          accounts, but does not act as a seller, escrow holder, shipping provider, or payment provider.
        </p>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          Read more: <a className="underline" href="/how-it-works">How it works</a>,{" "}
          <a className="underline" href="/legal/prohibited-items">Prohibited items</a>,{" "}
          <a className="underline" href="/legal/terms">Terms</a>.
        </p>
      </section>
    </main>
  );
}
'@

$payConfirm = @'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdult } from "@/lib/require-adult";
import { OrderStatus } from "@prisma/client";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  try {
    const orderId = String(ctx && ctx.params ? ctx.params.id : "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "Missing order id." }, { status: 400 });

    const gate = await requireAdult();
    if (!gate.ok) return NextResponse.json({ ok: false, error: gate.reason }, { status: gate.status });

    const userId = String(gate.dbUser && gate.dbUser.id ? gate.dbUser.id : "");
    if (!userId) return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        outcome: true,
        buyerId: true,
        listingId: true,
        pickupScheduledAt: true,
        listing: { select: { sellerId: true } },
      },
    });

    if (!order) return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });

    if (String(order.buyerId || "") !== userId) {
      return NextResponse.json({ ok: false, error: "Only the buyer can confirm this step." }, { status: 403 });
    }

    if (order.outcome === "CANCELLED") {
      return NextResponse.json({ ok: false, error: "Order cannot be confirmed in its current state." }, { status: 409 });
    }

    if (order.outcome === "COMPLETED") {
      return NextResponse.json({ ok: true, status: String(order.status), alreadyCompleted: true });
    }

    if (order.status !== OrderStatus.PICKUP_SCHEDULED) {
      return NextResponse.json({ ok: false, error: "Pickup must be scheduled before this step can be confirmed." }, { status: 409 });
    }

    if (!order.pickupScheduledAt) {
      return NextResponse.json({ ok: false, error: "Pickup time is missing for this order." }, { status: 409 });
    }

    try {
      await prisma.adminEvent.create({
        data: {
          type: "ORDER_PAYMENT_CONFIRM_BYPASSED_V2",
          userId: String(userId),
          orderId: order.id,
          data: {
            listingId: order.listingId ?? null,
            buyerId: order.buyerId ?? null,
            sellerId: order.listing ? String((order.listing as any).sellerId || "") : null,
            status: String(order.status),
            outcome: String(order.outcome),
          },
        },
      });
    } catch (e) {
      console.warn("[ADMIN_AUDIT] Failed to log ORDER_PAYMENT_CONFIRM_BYPASSED_V2", e);
    }

    return NextResponse.json({
      ok: true,
      status: String(order.status),
      v2NoPaymentStep: true,
      message: "There is no in-app payment confirmation step in Bidra V2. Follow the order and pickup flow shown in-app.",
    });
  } catch (e: any) {
    console.error("order.pay.confirm failed", e);
    return NextResponse.json({ ok: false, error: "Unable to confirm this step." }, { status: 500 });
  }
}
'@

Write-Utf8NoBom -Path $messagesPagePath -Content $messagesPage
Write-Utf8NoBom -Path $messagesThreadPath -Content $messagesThread
Write-Utf8NoBom -Path $helpPagePath -Content $helpPage
Write-Utf8NoBom -Path $howItWorksPath -Content $howItWorks
Write-Utf8NoBom -Path $supportPagePath -Content $supportPage
Write-Utf8NoBom -Path $payConfirmPath -Content $payConfirm
Write-Host '[OK] chunk 2 messaging and payment copy patch applied'
