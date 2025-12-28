"use client";

import ConfirmSubmitButton from "@/components/confirm-submit-button";

type Rec = "IGNORE" | "WARN" | "SUSPEND" | "DELETE" | string;

export default function AiRecommendActions({
  recommendation,
  sellerId,
  listingId,
  reportId,
  returnTo,
  isResolved,
}: {
  recommendation: Rec;
  sellerId?: string;
  listingId?: string | null;
  reportId?: string | null;
  returnTo: string;
  isResolved?: boolean;
}) {
  const gate = !!isResolved;

  const rec = String(recommendation || "IGNORE").toUpperCase();
  const sellerId2 = String(sellerId || "").trim();
  const listingId2 = String(listingId || "").trim();
  const reportId2 = String(reportId || "").trim();
  const backTo = String(returnTo || "/admin/reports").trim();
const wrap: React.CSSProperties = {
    marginTop: 10,
    padding: 12,
    border: "1px solid #e5e5e5",
    borderRadius: 12,
  };

  const pill: React.CSSProperties = {
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fafafa",
  };

  const btnBase: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 900,
    border: "1px solid #ddd",
    cursor: "pointer",
    color: "#111",
  };

  function HiddenBackTo() {
    return <input type="hidden" name="backTo" value={backTo} />;
  }

  function HiddenReportId() {
    return reportId ? <input type="hidden" name="reportId" value={reportId2} /> : null;
  }

  function RecommendedActions() {
    if (rec === "WARN") {
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {gate ? (<div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>Re-open this report to take enforcement actions.</div>) : null}<form action="/api/admin/users/strike" method="post" style={{ display: "inline" }}>
            <input type="hidden" name="userId" value={sellerId2} />
            <HiddenReportId />
            {listingId ? <input type="hidden" name="listingId" value={listingId2} /> : null}
            <HiddenBackTo />
            <ConfirmSubmitButton
              confirmMessage="Apply AI recommendation (WARN)? This will add 1 strike to the seller."
              style={{ ...btnBase, border: "1px solid #f5c2c2", background: "#ffeded" }}
              disabled={gate || !sellerId2}
            >
              AI: +1 Strike (WARN)
            </ConfirmSubmitButton>
          </form>

          <form action="/api/admin/users/block" method="post" style={{ display: "inline" }}>
            <input type="hidden" name="userId" value={sellerId2} />
            <input type="hidden" name="days" value="14" />
            <HiddenBackTo />
            <ConfirmSubmitButton
              confirmMessage="Block seller for 14 days? Use this for repeated or serious behavior."
              style={{ ...btnBase, border: "1px solid #ffe2a8", background: "#fff6e6" }}
              disabled={gate || !sellerId2}
            >
              AI: Block 14 days
            </ConfirmSubmitButton>
          </form>
        </div>
      );
    }

    if (rec === "SUSPEND") {
      return (
        <form action="/api/admin/listings/suspend" method="post" style={{ display: "inline" }}>
          <input type="hidden" name="listingId" value={listingId2} />
          <HiddenReportId />
          <HiddenBackTo />
          <ConfirmSubmitButton
            confirmMessage="Suspend this listing now? This removes it from public view."
            style={{ ...btnBase, border: "1px solid #ffe2a8", background: "#fff6e6" }}
            disabled={gate || !listingId2}
          >
            AI: Suspend listing
          </ConfirmSubmitButton>
        </form>
      );
    }

    if (rec === "DELETE") {
      return (
        <form action="/api/admin/listings/delete" method="post" style={{ display: "inline" }}>
          <input type="hidden" name="listingId" value={listingId2} />
          <HiddenReportId />
          <HiddenBackTo />
          <ConfirmSubmitButton
            confirmMessage="Delete this listing now? This removes it from public view."
            style={{ ...btnBase, border: "1px solid #ffb3b3", background: "#ffe6e6" }}
            disabled={gate || !listingId2}
          >
            AI: Delete listing
          </ConfirmSubmitButton>
        </form>
      );
    }

    return (
      <div style={{ fontWeight: 800 }}>
        AI recommended action: <span style={{ opacity: 0.7 }}>IGNORE</span>
      </div>
    );
  }

  function AlwaysAvailableIgnore() {
    return (
      <form action="/api/admin/reports/resolve" method="post" style={{ display: "inline" }}>
        <input type="hidden" name="id" value={reportId2} />
        <input type="hidden" name="resolved" value="true" />
        <ConfirmSubmitButton
          confirmMessage="Ignore this report and mark as resolved?"
          style={{ ...btnBase, border: "1px solid #ddd", background: "#fafafa" }}
          disabled={!reportId2}
        >
          Admin override: Mark resolved (IGNORE)
        </ConfirmSubmitButton>
      </form>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {gate ? (<div style={{ marginBottom: 8, fontSize: 12, opacity: 0.8 }}>Re-open this report to take enforcement actions.</div>) : null}<div style={{ fontWeight: 900 }}>AI Recommended Action:</div>
        <div style={pill}>{rec}</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <RecommendedActions />
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #eee" }}>
        <AlwaysAvailableIgnore />
      </div>

      <div style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
        One-click actions map to admin routes (WARN → strike/block, SUSPEND → suspend listing, DELETE → delete listing).
      </div>
    </div>
  );
}
