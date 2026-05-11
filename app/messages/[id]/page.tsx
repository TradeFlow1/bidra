import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { formatAuDateTime } from "@/lib/date";
import SendBox from "./components/send-box";
import InboxBackButton from "./components/inbox-back-button";
import ThreadActions from "./components/thread-actions";
import ThreadLiveRefresh from "./components/thread-live-refresh";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function displayName(u: any) {
  return u?.username || u?.name || u?.email || "User";
}

function SafetyNote() {
  return (
    <details className="rounded-2xl border border-[#D8E1F0] bg-white px-4 py-3 text-sm text-[var(--bidra-ink)] shadow-sm">
      <summary className="cursor-pointer select-none font-extrabold">Safety tips</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--bidra-ink-2)]">
        <li>Confirm pickup, postage, payment, and handover details in this chat.</li>
        <li>Do not share passwords, one-time codes, ID photos, gift cards, crypto transfers, or suspicious payment links.</li>
        <li>Report the chat if something feels wrong.</li>
      </ul>
    </details>
  );
}

export default async function MessagesThreadPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const threadId = String(params?.id || "").trim();

  if (!session?.user?.id) {
    const next = threadId ? `/messages/${encodeURIComponent(threadId)}` : "/messages";
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  const gate = await requireAdult(session);
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/dashboard");

  const me = String(session.user.id);
  if (!threadId) redirect("/messages");

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
    });

    if (!thread) redirect("/messages");

    const isParticipant = String(thread.buyerId) === me || String(thread.sellerId) === me;
    if (!isParticipant) redirect("/messages");

    if (thread.lastMessageAt) {
      const myLastRead = String(thread.buyerId) === me ? thread.buyerLastReadAt : thread.sellerLastReadAt;
      const needsStamp =
        !myLastRead || new Date(myLastRead).getTime() < new Date(thread.lastMessageAt).getTime();

      if (needsStamp) {
        await prisma.messageThread.update({
          where: { id: thread.id },
          data: String(thread.buyerId) === me ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
        });
      }
    }

    const other = String(thread.buyerId) === me ? thread.seller : thread.buyer;

    const anyListing = thread.listing as unknown as { id?: string | null; title?: string | null; images?: unknown; photos?: unknown } | null;
    const imgs =
      (anyListing && Array.isArray(anyListing.images) && anyListing.images.length)
        ? anyListing.images
        : (anyListing && Array.isArray(anyListing.photos) && anyListing.photos.length)
          ? anyListing.photos
          : [];
    const thumb = imgs && imgs.length ? String(imgs[0]) : "";

    const messages = await prisma.message.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: { id: true, body: true, createdAt: true, userId: true },
    });

    const otherLastReadAt = (String(thread.buyerId) === me ? thread.sellerLastReadAt : thread.buyerLastReadAt) || null;

    const myMessages = messages.filter((x) => String(x.userId) === me);
    const lastMyMessageAt = myMessages.length ? myMessages[myMessages.length - 1].createdAt : null;
    const lastMyMessageId = myMessages.length ? myMessages[myMessages.length - 1].id : null;

    const seenLastMyMessage =
      !!(lastMyMessageAt && otherLastReadAt && new Date(otherLastReadAt).getTime() >= new Date(lastMyMessageAt).getTime());

    return (
      <main className="bd-container sm:py-10">
        <div className="container max-w-5xl space-y-3 sm:space-y-4">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] shadow-sm">
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
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)] sm:text-4xl">Messages</h1>
                    <div className="mt-2 text-sm text-[var(--bidra-ink-2)]">
                      Conversation with <span className="font-semibold text-[var(--bidra-ink)]">{displayName(other)}</span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--bidra-ink-2)]">
                      Listing:{" "}
                      <Link
                        className="font-semibold text-[var(--bidra-ink)] hover:underline underline-offset-4"
                        href={`/listings/${thread.listing.id}`}
                      >
                        {thread.listing.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <InboxBackButton />
                <ThreadActions threadId={thread.id} />
                <Link
                  href={`/listings/${thread.listing.id}`}
                  className="w-full rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5 sm:w-auto"
                >
                  View listing
                </Link>
              </div>
            </div>
          </div>

          <ThreadLiveRefresh />
          <SafetyNote />

          <div className="px-1 text-sm font-extrabold text-[var(--bidra-ink)]">
            Send a message
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-3 shadow-sm sm:p-4">
            {messages.length ? (
              <div className="flex max-h-[56vh] flex-col gap-3 overflow-auto pr-1">
                {messages.map((m) => {
                  const mine = String(m.userId) === me;
                  const body = m.body;
                  const isLastMine = mine && lastMyMessageId && m.id === lastMyMessageId;

                  return (
                    <div key={m.id} className={"flex w-full " + (mine ? "justify-end" : "justify-start")}>
                      <div className="max-w-[86%] sm:max-w-[72%]">
                        <div
                          className={
                            "border px-4 py-3 text-sm leading-relaxed shadow-sm " +
                            (mine
                              ? "rounded-3xl rounded-br-md border-black/10 bg-[var(--bidra-ink)] text-white"
                              : "rounded-3xl rounded-bl-md border-[#BFDBFE] bg-[#EFF6FF] text-[var(--bidra-ink)]")
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
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 px-6 py-6 text-center">
                <div className="text-base font-semibold text-neutral-900">No messages yet</div>
                <div className="mt-1 text-sm text-neutral-600">
                  Start the conversation by asking about pickup, condition, or availability.
                </div>
              </div>
            )}

            <div className="mt-3 border-t border-[#D8E1F0] pt-3">
              <SendBox threadId={thread.id} />
            </div>
          </div>
        </div>
      </main>
    );
  } catch (_e) {
    return (
      <main className="bd-container sm:py-10">
        <div className="container max-w-5xl space-y-3 sm:space-y-4">
          <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-4 shadow-sm sm:p-6">
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--bidra-ink)] sm:text-4xl">Messages</h1>
          </div>

          <SafetyNote />

          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-base font-semibold text-[var(--bidra-ink)]">This conversation is temporarily unavailable</div>
            <div className="mt-1 text-sm text-[var(--bidra-ink-2)]">
              Please try again shortly.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="w-full rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5 sm:w-auto" href="/messages">Back to inbox</Link>
              <Link className="w-full rounded-xl border border-black/20 bg-white px-5 py-3 text-center text-sm font-extrabold text-black shadow-sm hover:bg-black/5 sm:w-auto" href="/support">Support</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
