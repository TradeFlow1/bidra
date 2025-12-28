"use client";

import ConfirmSubmitButton from "@/components/confirm-submit-button";

type Rec = "IGNORE" | "WARN" | "SUSPEND" | "DELETE" | string;

export default function AiRecommendActions(props: {
  recommendation: Rec;
  sellerId?: string;
  listingId?: string | null;
  reportId?: string | null;
  returnTo: string; // we treat this as backTo for routes
}) {
  const rec = String(props.recommendation || "IGNORE").toUpperCase();
  const sellerId = (props.sellerId || "").trim();
  const listingId = String(props.listingId || "").trim();
  const reportId = String(props.reportId || "").trim();
  const backTo = (props.returnTo || "/admin/reports").trim();

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
    return reportId ? <input type="hidden" name="reportId" value={reportId} /> : null;
  }

  function RecommendedActions() {
    if (rec === "WARN") {
      return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <form action="/api/admin/users/strike" method="post" style={{ display: "inline" }}>
            <input type="hidden" name="userId" value={sellerId} />
            <HiddenReportId />
            {listingId ? <input type="hidden" name="listingId" value={listingId} /> : null}
            <HiddenBackTo />
            <ConfirmSubmitButton
              confirmMessage="Apply AI recommendation (WARN)? This will add 1 strike to the seller."
              style={{ ...btnBase, border: "1px solid #f5c2c2", background: "#ffeded" }}
              disabled={!sellerId}
            >
              AI: +1 Strike (WARN)
            </ConfirmSubmitButton>
          </form>

          <form action="/api/admin/users/block" method="post" style={{ display: "inline" }}>
            <input type="hidden" name="userId" value={sellerId} />
            <input type="hidden" name="days" value="14" />
            <HiddenBackTo />
            <ConfirmSubmitButton
              confirmMessage="Block seller for 14 days? Use this for repeated or serious behavior."
              style={{ ...btnBase, border: "1px solid #ffe2a8", background: "#fff6e6" }}
              disabled={!sellerId}
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
          <input type="hidden" name="listingId" value={listingId} />
          <HiddenReportId />
          <HiddenBackTo />
          <ConfirmSubmitButton
            confirmMessage="Suspend this listing now? This removes it from public view."
            style={{ ...btnBase, border: "1px solid #ffe2a8", background: "#fff6e6" }}
            disabled={!listingId}
          >
            AI: Suspend listing
          </ConfirmSubmitButton>
        </form>
      );
    }

    if (rec === "DELETE") {
      return (
        <form action="/api/admin/listings/delete" method="post" style={{ display: "inline" }}>
          <input type="hidden" name="listingId" value={listingId} />
          <HiddenReportId />
          <HiddenBackTo />
          <ConfirmSubmitButton
            confirmMessage="Delete this listing now? This removes it from public view."
            style={{ ...btnBase, border: "1px solid #ffb3b3", background: "#ffe6e6" }}
            disabled={!listingId}
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
        <input type="hidden" name="id" value={reportId} />
        <input type="hidden" name="resolved" value="true" />
        <ConfirmSubmitButton
          confirmMessage="Ignore this report and mark as resolved?"
          style={{ ...btnBase, border: "1px solid #ddd", background: "#fafafa" }}
          disabled={!reportId}
        >
          Admin override: Mark resolved (IGNORE)
        </ConfirmSubmitButton>
      </form>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900 }}>AI Recommended Action:</div>
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
