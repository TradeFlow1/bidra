import React from "react";

type Props = {
  badgeFastResponder?: boolean;
  badgeConsistentSeller?: boolean;
  badgeNewSeller?: boolean;
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        border: "1px solid rgba(0,0,0,0.18)",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        background: "rgba(0,0,0,0.03)",
      }}
    >
      {children}
    </span>
  );
}

export default function ReputationBadges({
  badgeFastResponder,
  badgeConsistentSeller,
  badgeNewSeller,
}: Props) {
  const items: string[] = [];

  if (badgeFastResponder) items.push("Fast responder");
  if (badgeConsistentSeller) items.push("Consistent seller");
  if (badgeNewSeller) items.push("New seller");

  if (items.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      {items.map((t) => (
        <Pill key={t}>{t}</Pill>
      ))}
    </div>
  );
}
