import ReputationBadges from "@/components/reputation-badges";

type Props = {
  username?: string | null;
  suburb?: string | null;
  state?: string | null;
  joinedAt?: Date | string | null;
  activeCount: number;
  soldCount: number;
};

function fmtJoined(d?: Date | string | null) {
  if (!d) return null;
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export default function TrustPanel({
  username,
  suburb,
  state,
  joinedAt,
  activeCount,
  soldCount,
}: Props) {
  const displayName = (username && String(username).trim()) ? String(username).trim() : "Seller";
  const joined = fmtJoined(joinedAt);

  // Honest, minimal signals (no “fast responder” until we truly measure it)
  const badgeNewSeller = soldCount === 0;
  const badgeConsistentSeller = soldCount >= 3;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 12,
        background: "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Trusted signals</div>
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.75 }}>
            {displayName}
            {(suburb || state) ? (
              <> · {suburb}{suburb && state ? ", " : ""}{state}</>
            ) : null}
            {joined ? <> · Joined {joined}</> : null}
          </div>
        </div>

        <div style={{ fontSize: 13, textAlign: "right" }}>
          <div><strong>{activeCount}</strong> active</div>
          <div><strong>{soldCount}</strong> completed sales</div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <ReputationBadges
          badgeNewSeller={badgeNewSeller}
          badgeConsistentSeller={badgeConsistentSeller}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        We only show signals we can verify (no fake “fast responder” badges).
      </div>
    </div>
  );
}
