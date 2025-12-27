export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

function dollars(cents: number | null | undefined) {
  if (typeof cents !== "number") return "";
  return `$${(cents / 100).toFixed(2)}`;
}

type Outcome = "PENDING" | "COMPLETED" | "CANCELLED" | "DISPUTED" | string;

function outcomeMeta(outcome: Outcome) {
  const o = String(outcome || "PENDING").toUpperCase();
  if (o === "COMPLETED") return { label: "COMPLETED", bg: "#e6ffea", fg: "#14532d" };
  if (o === "CANCELLED") return { label: "CANCELLED", bg: "#f3f4f6", fg: "#111827" };
  if (o === "DISPUTED") return { label: "DISPUTED", bg: "#fff7ed", fg: "#9a3412" };
  return { label: "PENDING", bg: "#eef2ff", fg: "#1e3a8a" };
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login?next=/account");

  const userId = session.user.id;

  // Pending feedback = COMPLETED orders older than 48 hours where the user's role hasn't left feedback yet
  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const pendingFeedbackAsBuyer = await prisma.order.findMany({
    where: {
      buyerId: userId,
      outcome: "COMPLETED",
      createdAt: { lt: cutoff48h },
      buyerFeedbackAt: null,
    },
    orderBy: { createdAt: "asc" },
    take: 25,
    select: {
      id: true,
      createdAt: true,
      amount: true,
      listing: { select: { id: true, title: true } },
    },
  });

  const pendingFeedbackAsSeller = await prisma.order.findMany({
    where: {
      outcome: "COMPLETED",
      createdAt: { lt: cutoff48h },
      sellerFeedbackAt: null,
      listing: { sellerId: userId },
    },
    orderBy: { createdAt: "asc" },
    take: 25,
    select: {
      id: true,
      createdAt: true,
      amount: true,
      buyerId: true,
      listing: { select: { id: true, title: true } },
    },
  });

  // Purchases (latest 20)
  const purchases = await prisma.order.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      createdAt: true,
      outcome: true,
      status: true,
      amount: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      listing: { select: { id: true, title: true, sellerId: true } },
    },
  });

  // Sales (latest 20) = orders where user is listing seller
  const sales = await prisma.order.findMany({
    where: { listing: { sellerId: userId } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      createdAt: true,
      outcome: true,
      status: true,
      amount: true,
      buyerId: true,
      buyerFeedbackAt: true,
      sellerFeedbackAt: true,
      listing: { select: { id: true, title: true } },
    },
  });

  // Listings summary (latest 20)
  const myListings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      type: true,
      price: true,
      createdAt: true,
    },
  });

  // Policy status
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { policyStrikes: true, policyBlockedUntil: true, email: true },
  });

  const blocked =
    me?.policyBlockedUntil && me.policyBlockedUntil.getTime() > Date.now();

  const sectionCard: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 14,
    padding: 16,
    background: "#fff",
  };

  const h2: React.CSSProperties = { margin: 0, fontSize: 18 };

  const small: React.CSSProperties = {
    marginTop: 6,
    marginBottom: 0,
    opacity: 0.75,
    fontSize: 13,
  };

  const tableWrap: React.CSSProperties = {
    marginTop: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    borderRadius: 12,
    overflowX: "auto",
  };

  const th: React.CSSProperties = {
    textAlign: "left",
    padding: 10,
    borderBottom: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(0,0,0,0.03)",
    fontSize: 13,
    whiteSpace: "nowrap",
  };

  const td: React.CSSProperties = {
    padding: 10,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    fontSize: 13,
    verticalAlign: "top",
  };

  const badge = (text: string, bg: string, fg: string) => (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
      }}
    >
      {text}
    </span>
  );

  const actionLink = (href: string, label: string) => (
    <Link href={href} style={{ textDecoration: "underline", fontWeight: 700 }}>
      {label}
    </Link>
  );

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>My account</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.75 }}>
            Signed in as {me?.email || "your account"}.
          </p>
        </div>
</header>

      {/* Status */}
      <section style={{ marginTop: 16, ...sectionCard }}>
        <h2 style={h2}>Account status</h2>
        <p style={small}>
          {blocked ? (
            <>
              Status: {badge("Restricted", "#ffe2e2", "#7f1d1d")}  until{" "}
              {fmtDate(me?.policyBlockedUntil || null)}
            </>
          ) : (
            <>Status: {badge("Good standing", "#e6ffea", "#14532d")}</>
          )}{" "}
           Strikes: <b>{me?.policyStrikes ?? 0}</b>
        </p>
      </section>

      {/* Pending feedback */}
      <section style={{ marginTop: 16, ...sectionCard }}>
        <h2 style={h2}>Pending feedback</h2>
        <p style={small}>
          If feedback is overdue (older than 48 hours), listing is restricted until its completed.
        </p>

        <div
          style={{
            marginTop: 10,
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <div>
            <div style={{ fontWeight: 900 }}>
              As buyer ({pendingFeedbackAsBuyer.length})
            </div>
            {pendingFeedbackAsBuyer.length === 0 ? (
              <p style={small}>Nothing overdue.</p>
            ) : (
              <div style={tableWrap}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Action</th>
                      <th style={th}>Listing</th>
                      <th style={th}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFeedbackAsBuyer.map((o) => (
                      <tr key={o.id}>
                        <td style={td}>
                          {actionLink(`/orders/${o.id}/feedback`, "Leave feedback")}
                        </td>
                        <td style={td}>
                          <Link
                            href={`/listings/${o.listing.id}`}
                            style={{ textDecoration: "underline" }}
                          >
                            {o.listing.title}
                          </Link>
                        </td>
                        <td style={td}>{fmtDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontWeight: 900 }}>
              As seller ({pendingFeedbackAsSeller.length})
            </div>
            {pendingFeedbackAsSeller.length === 0 ? (
              <p style={small}>Nothing overdue.</p>
            ) : (
              <div style={tableWrap}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Action</th>
                      <th style={th}>Listing</th>
                      <th style={th}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFeedbackAsSeller.map((o) => (
                      <tr key={o.id}>
                        <td style={td}>
                          {actionLink(`/orders/${o.id}/feedback`, "Leave feedback")}
                        </td>
                        <td style={td}>
                          <Link
                            href={`/listings/${o.listing.id}`}
                            style={{ textDecoration: "underline" }}
                          >
                            {o.listing.title}
                          </Link>
                        </td>
                        <td style={td}>{fmtDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Purchases + Sales */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <section style={{ ...sectionCard }}>
          <h2 style={h2}>My purchases</h2>
          <p style={small}>Your most recent orders as a buyer.</p>

          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Listing</th>
                  <th style={th}>Outcome</th>
                  <th style={th}>Created</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={5}>
                      No purchases yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((o) => {
                    const meta = outcomeMeta(o.outcome as any);
                    const needsMyFeedback =
                      String(o.outcome) === "COMPLETED" && !o.buyerFeedbackAt;

                    return (
                      <tr key={o.id}>
                        <td style={td}>
                          <Link
                            href={`/listings/${o.listing.id}`}
                            style={{ textDecoration: "underline" }}
                          >
                            {o.listing.title}
                          </Link>
                        </td>
                        <td style={td}>{badge(meta.label, meta.bg, meta.fg)}</td>
                        <td style={td}>{fmtDate(o.createdAt)}</td>
                        <td style={td}>{dollars(o.amount)}</td>
                        <td style={td}>
                          {needsMyFeedback
                            ? actionLink(`/orders/${o.id}/feedback`, "Leave feedback")
                            : actionLink(`/orders/${o.id}/feedback`, "View")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ ...sectionCard }}>
          <h2 style={h2}>My sales</h2>
          <p style={small}>Your most recent orders as a seller.</p>

          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>Listing</th>
                  <th style={th}>Outcome</th>
                  <th style={th}>Created</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td style={td} colSpan={5}>
                      No sales yet.
                    </td>
                  </tr>
                ) : (
                  sales.map((o) => {
                    const meta = outcomeMeta(o.outcome as any);
                    const needsMyFeedback =
                      String(o.outcome) === "COMPLETED" && !o.sellerFeedbackAt;

                    return (
                      <tr key={o.id}>
                        <td style={td}>
                          <Link
                            href={`/listings/${o.listing.id}`}
                            style={{ textDecoration: "underline" }}
                          >
                            {o.listing.title}
                          </Link>
                        </td>
                        <td style={td}>{badge(meta.label, meta.bg, meta.fg)}</td>
                        <td style={td}>{fmtDate(o.createdAt)}</td>
                        <td style={td}>{dollars(o.amount)}</td>
                        <td style={td}>
                          {needsMyFeedback
                            ? actionLink(`/orders/${o.id}/feedback`, "Leave feedback")
                            : actionLink(`/orders/${o.id}/feedback`, "View")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* My listings */}
      <section style={{ marginTop: 16, ...sectionCard }}>
        <h2 style={h2}>My listings</h2>
        <p style={small}>Your latest listings.</p>

        <div style={tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Title</th>
                <th style={th}>Status</th>
                <th style={th}>Type</th>
                <th style={th}>Created</th>
                <th style={th} >Price</th>
              </tr>
            </thead>
            <tbody>
              {myListings.length === 0 ? (
                <tr>
                  <td style={td} colSpan={5}>
                    No listings yet.
                  </td>
                </tr>
              ) : (
                myListings.map((l) => (
                  <tr key={l.id}>
                    <td style={td}>
                      <Link href={`/listings/${l.id}`} style={{ textDecoration: "underline" }}>
                        {l.title}
                      </Link>
                    </td>
                    <td style={td}>{String(l.status || "")}</td>
                    <td style={td}>{String(l.type || "")}</td>
                    <td style={td}>{fmtDate(l.createdAt)}</td>
                    <td style={td}>{dollars(l.price)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}