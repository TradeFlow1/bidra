import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero, SectionCard } from "@/components/marketplace-redesign";
import { labelCategory } from "@/lib/labels";
import DateTimeText from "@/components/date-time-text";
import { formatAud } from "@/lib/money";

type AdminListingRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  type: string;
  status: string;
  price: number;
  createdAt: Date;
};

export default async function AdminListings() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const listings = (await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      category: true,
      location: true,
      type: true,
      status: true,
      price: true,
      createdAt: true,
    },
  })) as AdminListingRow[];

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Trust operations"
        title="Listings"
        description="Review listing state, price, category, location, and age before moderation action."
      />

      {listings.length === 0 ? (
        <EmptyState title="No listings to review" description="No listings need trust-operations review right now." />
      ) : (
        <div className="grid gap-3">
          {listings.map((l: AdminListingRow) => (
            <SectionCard key={l.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[#64748B]">
                    {labelCategory(l.category)} • {l.location}
                  </div>

                  <Link
                    className="mt-1 block truncate text-lg font-black tracking-tight text-[#0F172A] underline-offset-4 hover:underline"
                    href={`/admin/listings/${l.id}`}
                    title={l.title}
                  >
                    {l.title}
                  </Link>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge tone="info">{l.type}</Badge>
                    <Badge>{l.status}</Badge>
                    <Badge>{formatAud(l.price)}</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-[#D8E1EA] pt-3 lg:w-56 lg:border-t-0 lg:pt-0">
                  <div className="text-xs font-semibold text-[#64748B]">
                    Created <DateTimeText value={l.createdAt} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link className="bd-btn bd-btn-primary text-xs" href={`/admin/listings/${l.id}`}>
                      Review
                    </Link>
                    <Link className="bd-btn bd-btn-secondary text-xs" href={`/listings/${l.id}`}>
                      Public view
                    </Link>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
