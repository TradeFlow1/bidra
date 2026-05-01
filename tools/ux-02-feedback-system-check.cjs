const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");

function read(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.error("[UX-02] FAIL: Missing file: " + relativePath);
    process.exitCode = 1;
    return "";
  }
  return fs.readFileSync(fullPath, "utf8");
}

function check(text, snippet) {
  if (!text.includes(snippet)) {
    console.error("[UX-02] FAIL: Missing " + snippet);
    process.exitCode = 1;
  } else {
    console.log("[UX-02] PASS: Found " + snippet);
  }
}

const component = read("components/status-message.tsx");
const contact = read("app/contact/contact-form.tsx");
const feedback = read("app/feedback/feedback-client.tsx");
const watch = read("app/listings/[id]/watchlist-button.tsx");
const deleteListing = read("components/delete-listing-button.tsx");

check(component, 'type StatusTone = "success" | "error" | "info" | "warning";');
check(component, "role={role}");
check(component, 'aria-live={tone === "error" ? "assertive" : "polite"}');
check(contact, 'import StatusMessage from "@/components/status-message";');
check(contact, '<StatusMessage tone="success">{note}</StatusMessage>');
check(contact, '<StatusMessage tone="error">{error}</StatusMessage>');
check(feedback, 'import StatusMessage from "@/components/status-message";');
check(feedback, "statusTone");
check(feedback, "<StatusMessage tone={statusTone}>{status}</StatusMessage>");
check(watch, 'import StatusMessage from "@/components/status-message";');
check(watch, '<StatusMessage tone="success" className="text-xs">{message}</StatusMessage>');
check(watch, '<StatusMessage tone="error" className="text-xs">{error}</StatusMessage>');
check(deleteListing, 'import StatusMessage from "@/components/status-message";');
check(deleteListing, '<StatusMessage tone="error" className="mt-4">{error}</StatusMessage>');

for (const pair of [
  ["contact inline green", contact, "text-green-700"],
  ["contact inline red", contact, "text-red-700"],
  ["feedback plain aria live", feedback, '<div className="text-sm bd-ink2" aria-live="polite">{status}</div>'],
  ["watch inline emerald", watch, "border-emerald-200 bg-emerald-50"],
  ["watch inline red", watch, "border-red-200 bg-red-50"],
  ["delete inline red", deleteListing, "border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"],
]) {
  const [label, text, forbidden] = pair;
  if (text.includes(forbidden)) {
    console.error("[UX-02] FAIL: Inline feedback remains: " + label);
    process.exitCode = 1;
  } else {
    console.log("[UX-02] PASS: Inline feedback removed: " + label);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("[UX-02] Feedback system check completed.");
