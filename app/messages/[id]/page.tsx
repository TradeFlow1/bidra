import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import SendBox from "./components/send-box";
import LiveMessageList from "./components/live-message-list";

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


  return (
    <>
      <main className="bd-logged-in-page mx-auto flex min-h-[calc(100svh-8.25rem)] w-full max-w-[760px] flex-col px-2 pb-16 pt-2 text-[#120724] sm:px-6 sm:py-8 lg:max-w-[1280px] lg:px-10">
        <h1 className="sr-only">Messages</h1>

        <div className="mt-0 grid min-h-0 flex-1 gap-3 lg:mt-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-6">
          <aside className="hidden overflow-hidden rounded-[24px] border border-[#EDE9FE] bg-white shadow-[0_18px_52px_rgba(43,16,85,0.07)] lg:block">
            <Link href="/messages" className="block border-b border-[#F0EAFE] p-5 text-sm font-black text-[#6D28D9]">Back to messages</Link>
            <div className="flex gap-4 bg-[#FBF9FF] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F3FF] text-sm font-black text-[#6D28D9] sm:h-14 sm:w-14 sm:text-base">
                {thumb ? <Image src={thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(otherLabel)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-black sm:text-xl">{otherLabel}</h2>
                <p className="mt-1 text-sm font-semibold text-[#62516F]">{thread.listing?.title || "Listing"}</p>
                {thread.listing?.id ? <Link href={`/listings/${thread.listing.id}`} className="mt-4 inline-flex text-sm font-black text-[#6D28D9]">View listing</Link> : null}
              </div>
            </div>
            <div className="p-4 text-sm font-semibold leading-6 text-[#62516F]">Keep pickup, payment and handover details in Bidra messages.</div>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#EDE9FE] bg-white shadow-[0_18px_52px_rgba(43,16,85,0.07)] lg:rounded-[24px]">
            <div className="flex shrink-0 items-center justify-between border-b border-[#F0EAFE] p-3 sm:p-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F3FF] text-sm font-black text-[#6D28D9] sm:h-14 sm:w-14 sm:text-base">
                  {thumb ? <Image src={thumb} alt="" width={56} height={56} className="h-full w-full object-cover" unoptimized /> : initials(otherLabel)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-black sm:text-xl">{otherLabel}</h2>
                  <p className="mt-0.5 truncate text-xs font-semibold text-[#62516F] sm:mt-1 sm:text-sm">Member conversation</p>
                </div>
              </div>
              {thread.listing?.id ? <Link href={`/listings/${thread.listing.id}`} className="bd-btn bd-btn-secondary hidden rounded-2xl px-5 py-3 text-sm font-black sm:inline-flex">View listing</Link> : null}
            </div>

            <LiveMessageList threadId={thread.id} me={me} initialMessages={messages.map((message) => ({ id: message.id, body: message.body, createdAt: message.createdAt.toISOString(), userId: message.userId }))} />

            <div className="shrink-0 border-t border-[#F0EAFE] bg-white p-2 sm:p-3">
              <SendBox threadId={thread.id} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

