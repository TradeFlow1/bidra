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
  return dt.toLocaleDateString("en-AU", { year: "numeric", month: "short" });
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
  const badgeNewSeller = soldCount === 0;
  const badgeConsistentSeller = soldCount >= 3;

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-extrabold tracking-tight text-neutral-900">Trusted seller signals</div>
          <div className="mt-1 text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">{displayName}</span>
            {(suburb || state) ? (
              <> · {suburb}{suburb && state ? ", " : ""}{state}</>
            ) : null}
            {joined ? <> · Joined {joined}</> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-[180px]">
          <div className="rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-center">
            <div className="text-lg font-extrabold text-neutral-900">{activeCount}</div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">Active</div>
          </div>
          <div className="rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-center">
            <div className="text-lg font-extrabold text-neutral-900">{soldCount}</div>
            <div className="text-[11px] uppercase tracking-wide text-neutral-500">Sales</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <ReputationBadges
          badgeNewSeller={badgeNewSeller}
          badgeConsistentSeller={badgeConsistentSeller}
        />
      </div>

      <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
        We only show signals Bidra can verify, like completed sales and account history.
      </div>
    </div>
  );
}
