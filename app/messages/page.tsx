import Image from "next/image";
import Link from "next/link";
import InboxAutoRefresh from "./components/inbox-auto-refresh";
import DateTimeText from "@/components/date-time-text";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function SafetyNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 shadow-sm">
      Use messages to arrange pickup or postage, agree on key details, and keep a clear record.
    </div>
  );
}

export default async function MessagesInboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/messages");

  const gate = await requireAdult(session);
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/dashboard");

  const me = session.user.id;

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
    });

    const items: (typeof threads[number] & { unread: boolean })[] = threads.map((t) => {
      const myLastRead = t.buyerId === me ? t.buyerLastReadAt : t.sellerLastReadAt;
      const lastAt = t.lastMessageAt ? new Date(t.lastMessageAt) : null;
      const readAt = myLastRead ? new Date(myLastRead) : null;
      const unread = !!(lastAt && (!readAt || readAt.getTime() < lastAt.getTime()));
      return { ...t, unread };
    });

    const unreadCount = items.filter((i) => i.unread).length;

    items.sort((a, b) => {
      if (a.unread !== b.unread) return a.unread ? -1 : 1;
      const aT = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bT = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bT - aT;
    });

    return (
      <main className="bd-container py-5 sm:py-10">
        <div className="container max-w-5xl space-y-4 sm:space-y-5">
          <InboxAutoRefresh />

          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Inbox</div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)] sm:text-4xl">Messages</h1>
                <p className="mt-2 text-sm text-[var(--bidra-ink-2)] sm:text-base">
                  Use messages to chat about listings and arrange pickup or postage.
                </p>
              </div>

              <div className="grid min-w-[220px] gap-2 sm:grid-cols-2 md:min-w-[280px]">
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Conversations</div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{items.length}</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Unread</div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-950">{unreadCount}</div>
                </div>
              </div>
            </div>
          </div>

          <SafetyNotice />

          {unreadCount > 0 ? (
            <div className="rounded-2xl border border-[var(--bidra-blue)]/20 bg-[var(--bidra-blue)]/10 px-4 py-2.5 text-sm text-[var(--bidra-ink)] shadow-sm">
              <span className="font-semibold">Unread messages:</span>{" "}
              You have <span className="font-extrabold">{unreadCount}</span> unread {unreadCount === 1 ? "conversation" : "conversations"}.
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 bg-neutral-50 px-6 py-12 text-center shadow-sm">
              <div className="mx-auto max-w-xl">
                <div className="text-xl font-extrabold text-neutral-900">No messages yet</div>
                <p className="mt-2 text-sm text-neutral-600">
                  Start a conversation from a listing and your messages will show up here.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <Link href="/listings" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                    Browse listings
                  </Link>
                  <Link href="/dashboard" className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5">
                    Back to dashboard
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {items.map((it) => {
                const other = me === it.buyerId ? it.seller : it.buyer;
                const otherLabel = other.username || other.name || other.email || "User";
                const last = it.messages[0]?.body ? it.messages[0].body : "No messages yet.";

                const anyListing = it.listing as unknown as { id?: string | null; title?: string | null; images?: unknown; photos?: unknown } | null;
                const imgs =
                  (anyListing && Array.isArray(anyListing.images) && anyListing.images.length)
                    ? anyListing.images
                    : (anyListing && Array.isArray(anyListing.photos) && anyListing.photos.length)
                      ? anyListing.photos
                      : [];
                const thumb = imgs && imgs.length ? String(imgs[0]) : "";

                return (
                  <Link
                    key={it.id}
                    href={`/messages/${it.id}`}
                    className={`block rounded-3xl border p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:p-5 ${
                      it.unread
                        ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200 border-l-8"
                        : "border-black/10 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03]">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt="Listing photo"
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--bidra-ink-3)]">
                            No photo
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className={"truncate text-base " + (it.unread ? "font-extrabold text-[var(--bidra-ink)]" : "font-bold text-[var(--bidra-ink)]")}>
                              {it.listing?.title || "Listing"}
                            </div>
                            <div className="mt-1 truncate text-sm text-[var(--bidra-ink-2)]">With: {otherLabel}</div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {it.unread ? (
                              <span className="inline-flex items-center rounded-full border border-blue-300 bg-blue-600 px-2.5 py-1 text-[10px] font-extrabold text-white">
                                Unread
                              </span>
                            ) : null}
                            <DateTimeText className="text-xs text-[var(--bidra-ink-2)]" value={it.lastMessageAt} />
                          </div>
                        </div>

                        <div className={"mt-3 text-sm line-clamp-2 " + (it.unread ? "font-semibold text-[var(--bidra-ink)]" : "text-[var(--bidra-ink-2)]")}>
                          {last}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  } catch (_e) {
    return (
      <main className="bd-container py-5 sm:py-10">
        <div className="container max-w-5xl space-y-4 sm:space-y-5">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Inbox</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)] sm:text-4xl">Messages</h1>
          </div>

          <SafetyNotice />

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-[var(--bidra-ink)]">Messages are temporarily unavailable</div>
            <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
              Please try again shortly. If this keeps happening, use Support.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/dashboard">Dashboard</Link>
              <Link className="rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5" href="/support">Support</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
