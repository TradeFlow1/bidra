/* eslint-disable react-hooks/purity */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import AiRecommendActions from "@/components/ai-recommend-actions";
import { analyzeReportDeterministic } from "@/lib/ai/analyze";
import DateTimeText from "@/components/date-time-text";

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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Report not found</h1>
        <div style={{ marginTop: 10 }}>
          <Link href="/admin/reports" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 800 }}>← Back</Link>
        </div>
      </div>
    );
  }

  // ===== AI Analysis (deterministic stub) =====
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

  // Load seller enforcement state (so admin can strike/block quickly)
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

  const returnTo = encodeURIComponent(`/admin/reports/${report.id}`);
  const listingHref = report.listing?.id ? `/listings/${report.listing.id}` : null;

  const blockedUntilMs = seller?.policyBlockedUntil ? new Date(seller.policyBlockedUntil as Date | string | number).getTime() : null;
  const isBlocked = blockedUntilMs ? blockedUntilMs > Date.now() : false;

  const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 12, padding: 14, marginTop: 14 };
  const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" };
  const pill: React.CSSProperties = { fontSize: 12, fontWeight: 800, border: "1px solid #ddd", borderRadius: 999, padding: "3px 8px", display: "inline-block" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Report</h1>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
            Created: <DateTimeText value={report.createdAt} />
          </div>
        </div>

        <Link href="/admin/reports" style={{ textDecoration: "none", fontWeight: 900 }}>
          ← Back
        </Link>
      </div>

      {/* ===== AI Analysis ===== */}

<AiRecommendActions
  recommendation={ai.recommendation}
  sellerId={sellerId}
  listingId={listingId}
  reportId={report.id}
  returnTo={"/admin/reports/" + report.id}
  isResolved={isResolved}
/>
<div style={card}>
        <div style={row}>
          <div style={{ fontWeight: 900 }}>AI Analysis</div>


          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>Risk: {ai.riskLevel}</span>
            <span style={pill}>Recommend: {ai.recommendation}</span>
          </div>
        </div>

        <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.35 }}>{ai.summary}</p>

        {ai.signals?.length ? (
          <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18 }}>
            {ai.signals.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* ===== Report ===== */}
      <div style={card}>
        <div style={row}>
          <div style={{ fontWeight: 900 }}>Report details</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>{report.resolved ? "RESOLVED" : "OPEN"}</span>

              {!isResolved ? (
                <form action="/api/admin/reports/resolve" method="post" style={{ display: "inline-block" }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                  <button type="submit" className="bd-btn bd-btn-primary">
                    Resolve
                  </button>
                </form>
              ) : null}

              {isResolved ? (
                <form action="/api/admin/reports/reopen" method="post" style={{ display: "inline-block" }}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                  <button type="submit" className="bd-btn bd-btn-ghost">
                    Re-open
                  </button>
                </form>
              ) : null}
              
            <span style={pill}>Reason: {String(report.reason)}</span>
            <span style={pill}>Listing: {listingStatusLabel}</span>
          </div>
        </div>

        <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{report.details || "(no details)"}</div>
      </div>

      {/* ===== Listing ===== */}
      <div style={card}>
        <div style={{ fontWeight: 900 }}>Listing</div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 800 }}>{report.listing?.title || "(listing missing)"}</div>
          {listingHref ? (
            <div style={{ marginTop: 6 }}>
              <Link href={listingHref} style={{ textDecoration: "none", fontWeight: 800 }}>View listing →</Link>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.85 }}>
          Tip: DELETED listings are removed from public view.
        </div>
      </div>

      {/* ===== Reporter ===== */}
      <div style={card}>
        <div style={{ fontWeight: 900 }}>Reporter</div>
        <div style={{ marginTop: 8, fontSize: 13 }}>
          {report.reporter?.email ? report.reporter.email : report.reporterId}
        </div>
      </div>

      {/* ===== Listing actions ===== */}
      <div style={card}>
        <div style={row}>
          <div style={{ fontWeight: 900 }}>Listing actions</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>Status: {listingStatusLabel}</span>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {report.listing?.id ? (
            <>
              {!isResolved ? (
<form action="/api/admin/listings/suspend" method="post">
                <input type="hidden" name="listingId" value={report.listing.id} />
                <input type="hidden" name="reportId" value={report.id} />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button type="submit" className="bd-btn bd-btn-primary">
                  Suspend listing
                </button>
              </form>
) : null}

              {!isResolved ? (
<form action="/api/admin/listings/unsuspend" method="post">
                <input type="hidden" name="listingId" value={report.listing.id} />
                <input type="hidden" name="reportId" value={report.id} />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />
                <button type="submit" className="bd-btn bd-btn-ghost">
                  Unsuspend listing
                </button>
              </form>
) : null}

              {!isResolved ? (
<form action="/api/admin/listings/delete" method="post">
                <input type="hidden" name="listingId" value={report.listing.id} />
                <input type="hidden" name="reportId" value={report.id} />
                <input type="hidden" name="backTo" value={"/admin/reports/" + report.id} />

                <ConfirmSubmitButton className="bd-btn bd-btn-ghost !border-red-200 !bg-red-50 !text-red-900 hover:!bg-red-100" confirmMessage="Delete this listing now? This removes it from public view."
                >
                  Delete listing
                </ConfirmSubmitButton>
              </form>
) : null}
            </>
          ) : (
            <div style={{ opacity: 0.8 }}>(No listing attached)</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.75 }}>
      </div>
    </div>
  );
}



