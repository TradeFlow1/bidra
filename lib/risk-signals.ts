export type RiskSignalInput = {
  policyStrikes?: number | null;
  policyBlockedUntil?: Date | string | null;
  reportCount?: number | null;
  unresolvedReportCount?: number | null;
  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;
  ageVerified?: boolean | null;
  createdAt?: Date | string | null;
};

export type RiskSignal = {
  label: string;
  level: "high" | "medium" | "low" | "info";
  reason: string;
};

function isFutureDate(value: Date | string | null | undefined): boolean {
  if (!value) return false;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) && ms > Date.now();
}

function accountAgeDays(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000)));
}

export function getRiskSignals(input: RiskSignalInput): RiskSignal[] {
  const signals: RiskSignal[] = [];
  const strikes = Number(input.policyStrikes || 0);
  const reports = Number(input.reportCount || 0);
  const unresolvedReports = Number(input.unresolvedReportCount || 0);
  const ageDays = accountAgeDays(input.createdAt);

  if (isFutureDate(input.policyBlockedUntil)) {
    signals.push({
      label: "Temporary restriction active",
      level: "high",
      reason: "The account is currently restricted by policy-block tooling.",
    });
  }

  if (strikes >= 3) {
    signals.push({ label: "Multiple policy strikes", level: "high", reason: "Three or more policy strikes are recorded." });
  } else if (strikes > 0) {
    signals.push({ label: "Policy strike history", level: "medium", reason: "One or more policy strikes are recorded." });
  }

  if (unresolvedReports >= 3) {
    signals.push({ label: "Multiple open reports", level: "high", reason: "Several reports are still awaiting review." });
  } else if (unresolvedReports > 0) {
    signals.push({ label: "Open report exists", level: "medium", reason: "At least one report needs evidence review." });
  } else if (reports > 0) {
    signals.push({ label: "Report history", level: "low", reason: "Resolved report history exists for context." });
  }

  if (input.emailVerified === false) {
    signals.push({ label: "Email unconfirmed", level: "medium", reason: "Email confirmation is not recorded." });
  }

  if (input.phoneVerified === false) {
    signals.push({ label: "Phone unconfirmed", level: "low", reason: "Phone confirmation is not recorded." });
  }

  if (input.ageVerified === false) {
    signals.push({ label: "18+ not recorded", level: "medium", reason: "Adult account signal is not recorded." });
  }

  if (ageDays !== null && ageDays < 7) {
    signals.push({ label: "New account", level: "low", reason: "Account was created less than seven days ago." });
  }

  if (signals.length === 0) {
    signals.push({ label: "No elevated risk signals", level: "info", reason: "No active restriction, strike, open report, or missing core account signal was found." });
  }

  return signals;
}

export function riskLevelLabel(level: RiskSignal["level"]): string {
  if (level === "high") return "High";
  if (level === "medium") return "Medium";
  if (level === "low") return "Low";
  return "Info";
}

export function highestRiskLevel(signals: RiskSignal[]): RiskSignal["level"] {
  if (signals.some(function (signal) { return signal.level === "high"; })) return "high";
  if (signals.some(function (signal) { return signal.level === "medium"; })) return "medium";
  if (signals.some(function (signal) { return signal.level === "low"; })) return "low";
  return "info";
}
