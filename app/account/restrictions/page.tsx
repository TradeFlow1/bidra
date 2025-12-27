import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RestrictionsPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { policyStrikes: true, policyBlockedUntil: true },
  });

  const blockedUntil = dbUser?.policyBlockedUntil ? new Date(dbUser.policyBlockedUntil) : null;
  const isBlocked = blockedUntil ? blockedUntil.getTime() > Date.now() : false;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Account restrictions</h1>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>
          {isBlocked ? "Your account is temporarily restricted" : "No active restrictions"}
        </div>

        <div style={{ marginTop: 10, color: "#444", display: "grid", gap: 6 }}>
          <div><b>Policy strikes:</b> {dbUser?.policyStrikes ?? 0}</div>
          <div>
            <b>Restricted until:</b>{" "}
            {blockedUntil ? blockedUntil.toLocaleString("en-AU") : "—"}
          </div>
        </div>

        <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
          Restrictions are applied when repeated policy breaches occur (e.g., prohibited items, safety risks, fraud/scams).
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/legal/prohibited" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900 }}>
            Prohibited items
          </Link>
          <Link href="/legal/safety" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900 }}>
            Safety policy
          </Link>
          <Link href="/contact" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900 }}>
            Contact support
          </Link>
        </div>
      </div>

      <div>
        <Link href="/account" style={{ color: "#1DA1F2", textDecoration: "none", fontWeight: 900 }}>
          Back to My account
        </Link>
      </div>
    </div>
  );
}