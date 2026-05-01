import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import AiRecommendActions from "@/components/ai-recommend-actions";
import { analyzeReportDeterministic } from "@/lib/ai/analyze";
import DateTimeText from "@/components/date-time-text";

function SectionCard(props: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-sm font-extrabold bd-ink">{props.title}</div>
        {props.actions ? <div className="flex flex-wrap gap-2">{props.actions}</div> : null}
      </div>
      <div className="mt-4">{props.children}</div>
    </section>
  );
}

function MetaPill(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-neutral-900">
      {props.children}
    </span>
  );
}

export default async function AdminReportDetail({ params }: { params: { id: string } }) {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const report = await prisma.report.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      reason: true,
      details: true,
      resolved: true,
      createdAt: true,
      reporterId: true,
      reporter: { select: { email: true } },
      listingId: true,
      listing: { select: { id: true, title: true, status: true, sellerId: true } },
    },
  });

  if (!report) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl space-y-5">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight bd-ink">Report not found</h1>
            <div className="mt-4">
              <Link href="/admin/reports" className="bd-btn bd-btn-ghost text-center">
                Back to reports
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const listingAny = (report as unknown as { listing?: { id?: string; sellerId?: string; title?: string } | null }).listing ?? null;
  const listingId = listingAny?.id || (report as unknown as { listingId?: string | null }).listingId || null;
  const sellerIdForAi = listingAny?.sellerId || "";

  const [listingReportCount, sellerReportCount] = await Promise.all([
    listingId ? prisma.report.count({ where: ({ listingId } as Prisma.ReportWhereInput) }) : Promise.resolve(0),
    sellerIdForAi ? prisma.report.count({ where: ({ listing: { sellerId: sellerIdForAi } } as Prisma.ReportWhereInput) }) : Promise.resolve(0),
  ]);

  const ai = analyzeReportDeterministic({
    reason: (report as unknown as { reason?: string | null; type?: string | null }).reason ?? (report as unknown as { reason?: string | null; type?: string | null }).type ?? null,
    details: (report as unknown as { details?: string | null; message?: string | null; description?: string | null }).details ?? (report as unknown as { details?: string | null; message?: string | null; description?: string | null }).message ?? (report as unknown as { details?: string | null; message?: string | null; description?: string | null }).description ?? null,
    title: listingAny?.title ?? null,
    description: null,
    sellerReportCount,
    listingReportCount,
  });

  const sellerId = report.listing?.sellerId || "";
  const seller = sellerId
    ? await prisma.user.findUnique({
        where: { id: sellerId },
        select: { id: true, email: true, policyStrikes: true, policyBlockedUntil: true },
      })
    : null;

  const listingStatus = report.listing?.status || "UNKNOWN";
  const isResolved = !!report.resolved;

  const statusLabelMap: Record<string, string> = {
    DRAFT: "DRAFT (not published)",
    ACTIVE: "ACTIVE",
    ENDED: "ENDED",
    SOLD: "SOLD",
    SUSPENDED: "SUSPENDED (policy)",
    DELETED: "DELETED (admin removed)",
    UNKNOWN: "UNKNOWN",
  };

  const listingStatusLabel = statusLabelMap[String(listingStatus)] || String(listingStatus);
  const listingHref = report.listing?.id ? "/listings/" + report.listing.id : null;
  const blockedUntilMs = seller?.policyBlockedUntil ? new Date(seller.policyBlockedUntil as Date | string | number).getTime() : null;
  const isBlocked = blockedUntilMs ? blockedUntilMs > Date.now() : false;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin report detail</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Moderation report</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Review report context, evidence quality, AI analysis, listing state, reporter details, and enforcement actions before making an auditable trust decision.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin/reports" className="bd-btn bd-btn-ghost text-center">
                Back to reports
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">State</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{isResolved ? "Resolved" : "Open"}</div>
            <div className="mt-1 text-sm text-neutral-600">Current moderation state: open reports need triage; resolved reports have a recorded admin decision.</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Risk</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{ai.riskLevel}</div>
            <div className="mt-1 text-sm text-neutral-600">Deterministic AI assessment for triage support only; admins make the final moderation decision.</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recommendation</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{ai.recommendation}</div>
            <div className="mt-1 text-sm text-neutral-600">Suggested next step.</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Created</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950"><DateTimeText value={report.createdAt} /></div>
            <div className="mt-1 text-sm text-neutral-600">Original report timestamp for audit and response-time review.</div>
          </div>
        </div>

        <SectionCard title="Review checklist">
          <ul className="list-disc space-y-2 pl-5 text-sm bd-ink2 leading-7">
            <li>Read the report reason, details, linked messages, listing context, and any screenshots or IDs before taking action.</li>
            <li>Check the linked listing, seller state, reporter, repeated reports, prior restrictions, and related history where available.</li>
            <li>Use existing admin actions only when the evidence supports a proportional response such as clear, resolve, suspend, delete, strike, block, or reopen.</li>
            <li>Keep auditability in mind: every resolve, reopen, suspend, delete, strike, or block should be explainable from the report evidence.</li>
          </ul>
        </SectionCard>

        <AiRecommendActions
          recommendation={ai.recommendation}
          sellerId={sellerId}
          listingId={listingId}
          reportId={report.id}
          returnTo={"/admin/reports/" + report.id}
          isResolved={isResolved}
        />

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <SectionCard
              title="AI analysis"
              actions={
                <>
                  <MetaPill>Risk: {ai.riskLevel}</MetaPill>
                  <MetaPill>Recommend: {ai.recommendation}</MetaPill>
                </>
              }
            >
              <p className="text-sm bd-ink2 leading-7">{ai.summary}</p>
              {ai.signals?.length ? (
                <ul className="mt-4 list-disc pl-5 text-sm bd-ink2 leading-7 space-y-2">
                  {ai.signals.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : null}
            </SectionCard>

            <SectionCard
              title="Report details"
              actions={
                <>
                  <MetaPill>{report.resolved ? "RESOLVED - decision recorded" : "OPEN - needs triage"}</MetaPill>
                  <MetaPill>Reason: {String(report.reason)}</MetaPill>
                  <MetaPill>Listing: {listingStatusLabel}</MetaPill>
                  {!isResolved ? (
                    <form action="/api/admin/reports/resolve" method="post">
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                      <button type="submit" className="bd-btn bd-btn-primary">Resolve after evidence review</button>
                    </form>
                  ) : null}
                  {isResolved ? (
                    <form action="/api/admin/reports/reopen" method="post">
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                      <button type="submit" className="bd-btn bd-btn-ghost">Reopen for fresh evidence</button>
                    </form>
                  ) : null}
                </>
              }
            >
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">Evidence guide: compare the reporter details with listing content, recent messages, account history, and any attached IDs before actioning this report.</div>
              <div className="whitespace-pre-wrap text-sm bd-ink2 leading-7">{report.details || "(no details supplied - use surrounding listing, message, and account context before deciding)"}</div>
            </SectionCard>

            <SectionCard
              title="Listing actions"
              actions={<MetaPill>Status: {listingStatusLabel}</MetaPill>}
            >
              {report.listing?.id ? (
                <div className="flex flex-wrap gap-2">
                  {!isResolved ? (
                    <form action="/api/admin/listings/suspend" method="post">
                      <input type="hidden" name="listingId" value={report.listing.id} />
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                      <button type="submit" className="bd-btn bd-btn-primary">Suspend listing after evidence review</button>
                    </form>
                  ) : null}
                  {!isResolved ? (
                    <form action="/api/admin/listings/unsuspend" method="post">
                      <input type="hidden" name="listingId" value={report.listing.id} />
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                      <button type="submit" className="bd-btn bd-btn-ghost">Restore listing after evidence review</button>
                    </form>
                  ) : null}
                  {!isResolved ? (
                    <form action="/api/admin/listings/delete" method="post">
                      <input type="hidden" name="listingId" value={report.listing.id} />
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                      <ConfirmSubmitButton className="bd-btn bd-btn-ghost !border-red-200 !bg-red-50 !text-red-900 hover:!bg-red-100" confirmMessage="Remove this listing from public view after reviewing the report evidence?">
                        Delete listing
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm bd-ink2">(No listing attached)</div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Listing context">
              <div className="text-base font-extrabold bd-ink">{report.listing?.title || "(listing missing)"}</div>
              {listingHref ? (
                <div className="mt-4">
                  <Link href={listingHref} className="bd-btn bd-btn-ghost text-center">
                    View listing
                  </Link>
                </div>
              ) : null}
              <div className="mt-4 text-sm bd-ink2 leading-7">
                Tip: deleted listings are removed from public view, while suspended listings can be restored after evidence review. Preserve context before actioning.
              </div>
            </SectionCard>

            <SectionCard title="Reporter">
              <div className="text-sm bd-ink2 leading-7">
                {report.reporter?.email ? report.reporter.email : report.reporterId}
              </div>
            </SectionCard>

            <SectionCard title="Seller enforcement state">
              {seller ? (
                <div className="space-y-3 text-sm bd-ink2 leading-7">
                  <div><span className="font-extrabold bd-ink">Seller:</span> {seller.email}</div>
                  <div><span className="font-extrabold bd-ink">Policy strikes:</span> {seller.policyStrikes ?? 0}</div>
                  <div><span className="font-extrabold bd-ink">Blocked:</span> {isBlocked ? "Yes" : "No"}</div>
                  <div><span className="font-extrabold bd-ink">Blocked until:</span> {seller.policyBlockedUntil ? <DateTimeText value={seller.policyBlockedUntil} /> : "—"}</div>
                </div>
              ) : (
                <div className="text-sm bd-ink2">No seller record available.</div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}