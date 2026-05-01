import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DateTimeText from "@/components/date-time-text";
import { formatAud } from "@/lib/money";

function ModerationForm(props: {
  action: string;
  listingId: string;
  backTo: string;
  label: string;
  tone?: "danger" | "primary" | "ghost";
  placeholder: string;
}) {
  const className = props.tone === "danger"
    ? "bd-btn bd-btn-ghost !border-red-200 !bg-red-50 !text-red-900 hover:!bg-red-100"
    : props.tone === "primary"
      ? "bd-btn bd-btn-primary"
      : "bd-btn bd-btn-ghost";

  return (
    <form action={props.action} method="post" className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <input type="hidden" name="listingId" value={props.listingId} />
      <input type="hidden" name="backTo" value={props.backTo} />
      <label className="text-xs font-extrabold uppercase tracking-wide text-neutral-500" htmlFor={props.action.replace(/\W/g, "-") + "-reason"}>
        Moderation reason
      </label>
      <textarea
        id={props.action.replace(/\W/g, "-") + "-reason"}
        name="reason"
        required
        minLength={8}
        className="bd-input mt-2 min-h-[84px]"
        placeholder={props.placeholder}
      />
      <button type="submit" className={className + " mt-3 w-full justify-center"}>
        {props.label}
      </button>
    </form>
  );
}

export default async function AdminListingDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: { select: { id: true, email: true, username: true, policyStrikes: true, policyBlockedUntil: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, reason: true, resolved: true, createdAt: true },
      },
    },
  });

  if (!listing) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl">
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight bd-ink">Listing not found</h1>
            <p className="mt-2 text-sm bd-ink2">This listing could not be found or may no longer be available.</p>
            <div className="mt-5">
              <Link href="/admin/listings" className="bd-btn bd-btn-ghost text-center">Back to admin listings</Link>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  const backTo = "/admin/listings/" + listing.id;
  const auditLogs = await prisma.adminActionLog.findMany({
    where: { listingId: listing.id },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: { id: true, action: true, adminId: true, createdAt: true, meta: true },
  });

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin listing detail</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Moderate this listing directly from admin without falling back to the public listing page. Every action requires a reason and creates an audit log.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/listings" className="bd-btn bd-btn-ghost text-center">Admin listings</Link>
              <Link href={"/listings/" + listing.id} className="bd-btn bd-btn-ghost text-center">View public listing</Link>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{listing.status}</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Price</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{formatAud(listing.price)}</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Reports</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{listing.reports.length}</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Created</div>
            <div className="mt-1 text-sm font-semibold tracking-tight text-neutral-950"><DateTimeText value={listing.createdAt} /></div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-extrabold bd-ink">Moderation controls</h2>
            <p className="mt-2 text-sm bd-ink2">Suspend, delete, or restore the listing with a reason. The action is recorded in the admin audit log.</p>
            <div className="mt-4 grid gap-3">
              <ModerationForm
                action="/api/admin/listings/suspend"
                listingId={listing.id}
                backTo={backTo}
                label="Suspend listing"
                tone="primary"
                placeholder="Explain why this listing should be suspended."
              />
              <ModerationForm
                action="/api/admin/listings/delete"
                listingId={listing.id}
                backTo={backTo}
                label="Delete listing"
                tone="danger"
                placeholder="Explain why this listing should be removed from public view."
              />
              <ModerationForm
                action="/api/admin/listings/unsuspend"
                listingId={listing.id}
                backTo={backTo}
                label="Restore listing"
                tone="ghost"
                placeholder="Explain why this listing should be restored to active."
              />
            </div>
          </Card>

          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-extrabold bd-ink">Listing context</h2>
            <div className="mt-4 space-y-3 text-sm bd-ink2">
              <div><span className="font-semibold bd-ink">Seller:</span> {listing.seller?.email || listing.seller?.username || listing.sellerId}</div>
              <div><span className="font-semibold bd-ink">Category:</span> {listing.category}</div>
              <div><span className="font-semibold bd-ink">Location:</span> {listing.location}</div>
              <div><span className="font-semibold bd-ink">Description:</span></div>
              <div className="whitespace-pre-wrap rounded-2xl border border-black/10 bg-neutral-50 p-3">{listing.description || "(no description)"}</div>
            </div>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-extrabold bd-ink">Recent reports</h2>
            <div className="mt-4 space-y-3">
              {listing.reports.length ? listing.reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{report.resolved ? "Resolved" : "Open"}</Badge>
                    <Badge>{String(report.reason)}</Badge>
                  </div>
                  <div className="mt-2 text-xs bd-ink2"><DateTimeText value={report.createdAt} /></div>
                  <div className="mt-2"><Link className="bd-link font-semibold" href={"/admin/reports/" + report.id}>Open report</Link></div>
                </div>
              )) : <div className="text-sm bd-ink2">No recent reports for this listing.</div>}
            </div>
          </Card>

          <Card className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-extrabold bd-ink">Audit log</h2>
            <div className="mt-4 space-y-3">
              {auditLogs.length ? auditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-3 text-sm">
                  <div className="font-semibold bd-ink">{log.action}</div>
                  <div className="mt-1 text-xs bd-ink2">Admin {log.adminId} • <DateTimeText value={log.createdAt} /></div>
                  <pre className="mt-2 overflow-auto rounded-xl bg-white p-2 text-xs text-neutral-700">{JSON.stringify(log.meta, null, 2)}</pre>
                </div>
              )) : <div className="text-sm bd-ink2">No listing audit events yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
