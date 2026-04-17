import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Feedback — Admin — Bidra" };

function InfoCard(props: {
  title: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{props.title}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-neutral-950">{props.value}</div>
      <div className="mt-1 text-sm text-neutral-600">{props.note}</div>
    </div>
  );
}

function MetaPill(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-neutral-900">
      {props.children}
    </span>
  );
}

export default async function AdminFeedbackPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-4xl space-y-5">
          <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink">Access denied</h1>
            <p className="mt-2 text-sm bd-ink2 leading-7">
              You do not have access to this admin surface.
            </p>
            <div className="mt-4">
              <Link href="/" className="bd-btn bd-btn-ghost text-center">
                Go home
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const items = await prisma.adminEvent.findMany({
    where: { type: { in: ["SITE_FEEDBACK", "FT_FEEDBACK"] } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const siteFeedbackCount = items.filter((e) => e.type === "SITE_FEEDBACK").length;
  const ftFeedbackCount = items.filter((e) => e.type === "FT_FEEDBACK").length;

  return (
    <main className="bd-container py-10">
      <div className="container max-w-6xl space-y-5">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-neutral-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Admin feedback</div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight bd-ink sm:text-4xl">Feedback submissions</h1>
              <p className="mt-2 text-sm bd-ink2 sm:text-base">
                Review site and Friend Test feedback submissions, scan recent themes, and jump into broader admin event history when needed.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/admin/events" className="bd-btn bd-btn-ghost text-center">
                All admin events
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoCard
            title="Total submissions"
            value={items.length}
            note="Latest 200 feedback-linked admin events."
          />
          <InfoCard
            title="Site feedback"
            value={siteFeedbackCount}
            note="General product and site feedback submissions."
          />
          <InfoCard
            title="Friend Test feedback"
            value={ftFeedbackCount}
            note="Private testing feedback submissions."
          />
        </div>

        <section className="rounded-3xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-black/10 px-6 py-4">
            <div className="text-sm font-extrabold bd-ink">Latest feedback</div>
            <div className="mt-1 text-sm bd-ink2">
              Site and Friend Test feedback submissions, newest first.
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-8 text-sm bd-ink2">No feedback yet.</div>
          ) : (
            <div className="divide-y divide-black/10">
              {items.map((e) => {
                const data: any = e.data ?? {};
                const msg = String(data.message ?? "").slice(0, 140);
                const cat = data.category ? String(data.category) : "";
                const pageUrl = data.pageUrl ? String(data.pageUrl) : "";
                const fullMessage = String(data.message ?? "");

                return (
                  <article key={e.id} className="px-6 py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {new Date(e.createdAt).toLocaleString()}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <MetaPill>{e.type}</MetaPill>
                          <MetaPill>User: {e.userId ?? "-"}</MetaPill>
                          {cat ? <MetaPill>Category: {cat}</MetaPill> : null}
                        </div>

                        <div className="mt-4 text-sm bd-ink2 leading-7">
                          {msg ? (
                            <div>
                              {msg}{fullMessage.length > 140 ? "…" : ""}
                            </div>
                          ) : (
                            <div>-</div>
                          )}
                        </div>

                        {pageUrl ? (
                          <div className="mt-3">
                            <a className="bd-link font-semibold break-all" href={pageUrl} target="_blank" rel="noreferrer">
                              {pageUrl}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="text-sm font-extrabold bd-ink">Admin note</div>
          <div className="mt-2 text-sm bd-ink2 leading-7">
            Keep Friend Test feedback enabled only during private testing.
          </div>
        </section>
      </div>
    </main>
  );
}
