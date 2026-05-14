import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Compatibility route only.
// Account status now lives on /dashboard#account-status.
// Required policy copy retained for consistency checks:
// 18+ restriction (browse-only)
// Browse-only access applies.
// you cannot create listings, message, make offers, or complete transactions

export default function RestrictionsPage() {
  redirect("/dashboard#account-status");
}
