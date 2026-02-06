/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Feedback — Admin — Bidra" };

export default async function AdminFeedbackPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return (
      <main className="bd-shell py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold bd-ink">Admin</h1>
          <p className="mt-2 bd-ink2">You don’t have access to this page.</p>
          <div className="mt-4">
            <Link href="/" className="bd-btn bd-btn-outline">Go home</Link>
          </div>
        </div>
      </main>
    );
  }

  const items = await prisma.adminEvent.findMany({
    where: { type: { in: ["SITE_FEEDBACK", "FT_FEEDBACK"] } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Feedback</h1>
            <p className="mt-2 bd-ink2">Site + Friend Test feedback submissions (latest first).</p>
          </div>
          <Link href="/admin/events" className="bd-btn bd-btn-outline">All admin events</Link>
        </div>

        <div className="mt-6 rounded-xl border bd-bd bg-white">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b bd-bd bg-white/60">
                <tr className="text-left">
                  <th className="px-4 py-3 font-extrabold bd-ink">Time</th>
                  <th className="px-4 py-3 font-extrabold bd-ink">Type</th>
                  <th className="px-4 py-3 font-extrabold bd-ink">User</th>
                  <th className="px-4 py-3 font-extrabold bd-ink">Summary</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => {
                  const data: any = e.data ?? {};
                  const msg = String(data.message ?? "").slice(0, 140);
                  const cat = data.category ? String(data.category) : "";
                  const pageUrl = data.pageUrl ? String(data.pageUrl) : "";
                  return (
                    <tr key={e.id} className="border-b bd-bd last:border-b-0 align-top">
                      <td className="px-4 py-3 bd-ink2 whitespace-nowrap">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 bd-ink2 whitespace-nowrap">{e.type}</td>
                      <td className="px-4 py-3 bd-ink2 whitespace-nowrap">{e.userId ?? "-"}</td>
                      <td className="px-4 py-3 bd-ink2">
                        {cat ? <div className="font-semibold bd-ink">{cat}</div> : null}
                        {msg ? <div>{msg}{String(data.message ?? "").length > 140 ? "…" : ""}</div> : <div>-</div>}
                        {pageUrl ? <div className="mt-1"><a className="bd-link" href={pageUrl} target="_blank" rel="noreferrer">{pageUrl}</a></div> : null}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 bd-ink2" colSpan={4}>No feedback yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm bd-ink2">
          Tip: keep Friend Test feedback enabled only during private testing.
        </div>
      </div>
    </main>
  );
}

