import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import SendBox from "./components/send-box";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function displayName(user: { username?: string | null; name?: string | null; email?: string | null } | null) {
  return user?.username || user?.name || user?.email || "User";
}

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

export default async function MessagesThreadPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const threadId = String(params?.id || "").trim();

  if (!session?.user?.id) {
    const next = threadId ? `/messages/${encodeURIComponent(threadId)}` : "/messages";
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  const gate = await requireAdult(session);
  if (!gate.ok && gate.reason === "UNDER_18") redirect("/account/restrictions");
  if (!gate.ok) redirect("/account");

  const me = String(session.user.id);
  if (!threadId) redirect("/messages");

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
    const needsStamp = !myLastRead || new Date(myLastRead).getTime() < new Date(thread.lastMessageAt).getTime();
    if (needsStamp) {
      await prisma.messageThread.update({
        where: { id: thread.id },
        data: String(thread.buyerId) === me ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
      });
    }
  }

  const other = String(thread.buyerId) === me ? thread.seller : thread.buyer;
  const otherLabel = displayName(other);
  const thumb = imageFromListing(thread.listing);

  const messages = await prisma.message.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, body: true, createdAt: true, userId: true },
  });

  const otherLastReadAt = (String(thread.buyerId) === me ? thread.sellerLastReadAt : thread.buyerLastReadAt) || null;
  const myMessages = messages.filter((message) => String(message.userId) === me);
  const lastMyMessageAt = myMessages.length ? myMessages[myMessages.length - 1].createdAt : null;
  const lastMyMessageId = myMessages.length ? myMessages[myMessages.length - 1].id : null;
  const seenLastMyMessage = Boolean(lastMyMessageAt && otherLastReadAt && new Date(otherLastReadAt).getTime() >= new Date(lastMyMessageAt).getTime());

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] px-5 py-10 text-[#07152E] sm:px-8 lg:px-10">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Messages</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[24px] border border-[#DCE5F2] bg-white shadow-sm">
            <Link href="/messages" className="block border-b border-[#E2E8F0] p-5 text-sm font-black text-[#4F46E5]">Back to messages</Link>
            <div className="flex gap-4 bg-[#F8FAFC] p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF2FF] text-base font-black text-[#4F46E5]">
                {thumb ? <Image src={thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(otherLabel)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black">{otherLabel}</h2>
                <p className="mt-1 text-sm font-semibold text-[#64748B]">{thread.listing?.title || "Listing"}</p>
                {thread.listing?.id ? <Link href={`/listings/${thread.listing.id}`} className="mt-4 inline-flex text-sm font-black text-[#4F46E5]">View listing</Link> : null}
              </div>
            </div>
            <div className="p-5 text-sm font-semibold leading-6 text-[#64748B]">Keep pickup, payment and handover details in Bidra messages.</div>
          </aside>

          <section className="overflow-hidden rounded-[24px] border border-[#DCE5F2] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEF2FF] text-base font-black text-[#4F46E5]">
                  {thumb ? <Image src={thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(otherLabel)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black">{otherLabel}</h2>
                  <p className="mt-1 truncate text-sm font-semibold text-[#64748B]">Member conversation</p>
                </div>
              </div>
              {thread.listing?.id ? <Link href={`/listings/${thread.listing.id}`} className="rounded-2xl border border-[#C7D2FE] px-5 py-3 text-sm font-black text-[#4F46E5]">View listing</Link> : null}
            </div>

            <div className="space-y-5 px-6 py-7">
              <div className="flex items-center gap-5 text-sm font-black text-[#64748B]">
                <div className="h-px flex-1 bg-[#E2E8F0]" />
                <span>Today</span>
                <div className="h-px flex-1 bg-[#E2E8F0]" />
              </div>

              {messages.map((message) => {
                const mine = String(message.userId) === me;
                const seen = mine && message.id === lastMyMessageId && seenLastMyMessage;

                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] ${mine ? "text-right" : "text-left"}`}>
                      <div className={`rounded-2xl px-5 py-4 text-base font-semibold leading-6 shadow-sm ${mine ? "bg-[#EEF2FF] text-[#07152E]" : "bg-[#F8FAFC] text-[#07152E]"}`}>
                        {message.body}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-[#64748B]">
                        {message.createdAt.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}{seen ? " - seen" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 ? (
                <div className="rounded-[24px] border border-[#DCE5F2] bg-[#F8FAFC] p-8 text-center">
                  <h3 className="text-2xl font-black">No messages yet</h3>
                  <p className="mt-3 text-base font-semibold text-[#64748B]">Start the conversation below.</p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#E2E8F0] p-5">
              <SendBox threadId={thread.id} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

