import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Textarea } from "@/components/ui";

export default async function MessagesPage({ params }: { params: { listingId: string } }) {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  const listing = await prisma.listing.findUnique({
    where: { id: params.listingId },
    include: { seller: true }
  });
  if (!listing) redirect("/listings");

  const messages = await prisma.message.findMany({
    where: { listingId: listing.id },
    orderBy: { createdAt: "asc" },
    take: 200
  });

  async function send(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    await prisma.message.create({
      data: { body, userId: u.id, listingId: "${listing.id}" }
    });

    redirect("/messages/${listing.id}");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm text-neutral-600">
            Listing: <Link className="hover:underline" href={"/listing/" + listing.id}>{listing.title}</Link>
          </div>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <Link href={"/listing/" + listing.id} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Back to listing</Link>
      </div>

      <Card className="max-h-[55vh] overflow-auto">
        {messages.length ? (
          <div className="flex flex-col gap-2">
            {messages.map((m: any) => (
              <div key={m.id} className="text-sm">
                <span className="text-neutral-500">{new Date(m.createdAt).toLocaleString("en-AU")} • </span>
                <b>{m.userId === user.id ? "You" : "Other user"}</b>: {m.body}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-600">No messages yet.</div>
        )}
      </Card>

      <Card>
        <form action={send} className="flex flex-col gap-2">
          <Textarea name="body" placeholder="Write a message..." required />
          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Send</Button>
          <div className="text-xs text-neutral-600">
            Tip: Keep personal information minimal until you're confident.
          </div>
        </form>
      </Card>
    </div>
  );
}
