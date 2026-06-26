import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SendBox from "./[id]/components/send-box";
import AccountNav from "@/components/account-nav";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function imageFromListing(listing: { images: unknown; photos: unknown } | null) {
  const images = Array.isArray(listing?.images) ? listing?.images : [];
  const photos = Array.isArray(listing?.photos) ? listing?.photos : [];
  const first = images.length ? images[0] : photos.length ? photos[0] : "";
  return first ? String(first) : "";
}

function messageTime(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default async function MessagesInboxPage({ searchParams }: { searchParams?: { thread?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/messages");

  const gate = await requireAdult(session);
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/account");

  const incomingThreadId = typeof searchParams?.thread === "string" ? searchParams.thread.trim() : "";
  if (incomingThreadId) redirect(`/messages/${encodeURIComponent(incomingThreadId)}`);

  const me = session.user.id;

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

  const items = threads.map((thread) => {
    const myLastRead = thread.buyerId === me ? thread.buyerLastReadAt : thread.sellerLastReadAt;
    const lastAt = thread.lastMessageAt ? new Date(thread.lastMessageAt) : null;
    const readAt = myLastRead ? new Date(myLastRead) : null;
    const unread = Boolean(lastAt && (!readAt || readAt.getTime() < lastAt.getTime()));
    const other = me === thread.buyerId ? thread.seller : thread.buyer;
    const otherLabel = other.username || other.name || other.email || "User";
    const last = thread.messages[0]?.body || "No messages yet.";
    const thumb = imageFromListing(thread.listing);
    return { ...thread, unread, otherLabel, last, thumb };
  });

  const selected = items[0] || null;

  const selectedMessages = selected
    ? await prisma.message.findMany({
        where: { threadId: selected.id },
        orderBy: { createdAt: "asc" },
        take: 200,
        select: { id: true, body: true, createdAt: true, userId: true },
      })
    : [];

  return (
    <>
      <main className="bd-logged-in-page mx-auto w-full max-w-[1440px] px-2 pb-24 pt-3 text-[#120724] sm:px-6 sm:py-8 lg:px-8">
        <div className="hidden md:block">
          <AccountNav active="messages" />
        </div>

        <section className="md:hidden">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#6D28D9]">Inbox</div>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.055em] text-[#120724]">Messages</h1>
            </div>
            <Link href="/listings" className="bd-btn bd-btn-primary flex h-11 items-center rounded-2xl px-4 text-sm font-black !text-white">
              Browse
            </Link>
          </div>
        </section>

        <section className="bd-logged-in-hero mt-5 hidden md:block">
          <div>
            <div className="bd-logged-in-eyebrow">Messages</div>
            <h1 className="bd-logged-in-title">Messages</h1>
            <p className="bd-logged-in-copy">Keep buyer and seller conversations in one place.</p>
          </div>
        </section>

        {items.length === 0 ? (
          <div className="mt-8 rounded-[30px] border border-[#EDE9FE] bg-white p-10 text-center shadow-[0_22px_60px_rgba(43,16,85,0.08)]">
            <h2 className="text-2xl font-black">No messages yet</h2>
            <p className="mt-3 text-base font-semibold text-[#62516F]">Messages from listings and orders will appear here.</p>
            <Link href="/listings" className="bd-btn bd-btn-primary mt-6 inline-flex h-12 items-center rounded-2xl px-6 text-sm font-black !text-white">Browse listings</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[400px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-[20px] border border-[#EDE9FE] bg-white shadow-[0_18px_52px_rgba(43,16,85,0.07)] md:rounded-[24px]">
              {items.map((thread) => (
                <Link key={thread.id} href={`/messages/${thread.id}`} className={`flex min-h-[88px] gap-3 border-b border-[#F0EAFE] p-4 last:border-b-0 active:bg-[#FBF9FF] md:min-h-0 md:gap-4 md:p-5 md:hover:bg-[#FBF9FF] ${selected?.id === thread.id ? "bg-[#FBF9FF] shadow-[inset_4px_0_0_#7C3AED]" : ""}`}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F3FF] text-sm font-black text-[#6D28D9] md:text-base">
                    {thread.thumb ? <Image src={thread.thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(thread.otherLabel)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="truncate text-[15px] font-black leading-5 text-[#120724] md:text-base">{thread.otherLabel}</h2>
                      <span className="shrink-0 text-xs font-bold text-[#8B7A98] md:text-sm">{messageTime(thread.lastMessageAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-bold text-[#3B254F]">{thread.listing?.title || "Listing"}</p>
                    <p className="mt-1 truncate text-sm font-medium text-[#62516F]">{thread.last}</p>
                  </div>
                  {thread.unread ? <span aria-label="Unread" className="mt-8 h-3.5 w-3.5 shrink-0 rounded-full bg-[#7C3AED] ring-4 ring-[#F5F3FF] !text-white disabled:!text-white" /> : null}
                </Link>
              ))}

              <div className="hidden p-5">
                <Link href="/messages" className="bd-btn bd-btn-secondary flex h-12 items-center justify-center rounded-2xl text-sm font-black">View all messages</Link>
              </div>
            </aside>

            <section className="hidden overflow-hidden rounded-[24px] border border-[#EDE9FE] bg-white shadow-[0_18px_52px_rgba(43,16,85,0.07)] lg:block">
              <div className="flex items-center justify-between border-b border-[#F0EAFE] p-4 md:p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F3FF] text-sm font-black text-[#6D28D9] md:text-base">
                    {selected?.thumb ? <Image src={selected.thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(selected?.otherLabel || "User")}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black md:text-xl">{selected?.otherLabel || "Select a message"}</h2>
                    <p className="mt-1 truncate text-sm font-semibold text-[#62516F]">{selected?.listing?.title || "Open a thread to continue the conversation"}</p>
                  </div>
                </div>
                {selected?.listing?.id ? <Link href={`/listings/${selected.listing.id}`} className="bd-btn bd-btn-secondary rounded-2xl px-5 py-3 text-sm font-black">View listing</Link> : null}
              </div>

              {selected ? (
                <>
                  <div className="min-h-[280px] space-y-4 px-4 py-5 md:min-h-[380px] md:space-y-5 md:px-6 md:py-7">
                    <div className="flex items-center gap-5 text-sm font-black text-[#8B7A98]">
                      <div className="h-px flex-1 bg-[#F0EAFE]" />
                      <span>Today</span>
                      <div className="h-px flex-1 bg-[#F0EAFE]" />
                    </div>

                    {selectedMessages.length ? selectedMessages.map((message) => {
                      const mine = String(message.userId) === me;

                      return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}>
                            <div className={`rounded-2xl px-5 py-4 text-base font-semibold leading-6 shadow-sm ${mine ? "bd-message-bubble-mine" : "bd-message-bubble-other"}`}>
                              {message.body}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-[#8B7A98]">
                              {messageTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="rounded-[24px] border border-[#EDE9FE] bg-[#FBF9FF] p-8 text-center">
                        <h3 className="text-2xl font-black">No messages yet</h3>
                        <p className="mt-3 text-base font-semibold text-[#62516F]">Start the conversation below.</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#F0EAFE] p-5">
                    <SendBox threadId={selected.id} />
                  </div>
                </>
              ) : (
                <div className="flex min-h-[380px] flex-col justify-center px-6 text-center">
                  <div className="mx-auto max-w-md rounded-[24px] border border-[#EDE9FE] bg-[#FBF9FF] p-8">
                    <h3 className="text-2xl font-black">Select a conversation</h3>
                    <p className="mt-3 text-base font-semibold leading-7 text-[#62516F]">Open a message thread to confirm price, payment, pickup and handover details in one place.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
