import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge } from "@/components/ui";

export default async function AdminReports() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { listing: true },
    take: 200
  });

  async function resolve(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");
    if (u.role !== "ADMIN") redirect("/");

    const id = String(formData.get("id") ?? "");
    await prisma.report.update({ where: { id }, data: { resolved: true } });
    redirect("/admin/reports");
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Reports</h1>
      <div className="grid gap-3">
        {reports.map(r => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-neutral-600">
                  {r.resolved ? <Badge>Resolved</Badge> : <Badge className="border-amber-500 text-amber-700">Open</Badge>}
                  <span className="ml-2">{new Date(r.createdAt).toLocaleString("en-AU")}</span>
                </div>
                <div className="mt-1 font-semibold">Reason: {r.reason}</div>
                {r.details ? <div className="mt-1 text-sm text-neutral-700">{r.details}</div> : null}
                <div className="mt-2">
                  <Link className="text-sm underline" href={"/listing/" + r.listingId}>View listing</Link>
                </div>
              </div>

              {!r.resolved ? (
                <form action={resolve}>
                  <input type="hidden" name="id" value={r.id} />
                  <Button type="submit">Mark resolved</Button>
                </form>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {!reports.length ? <div className="text-sm text-neutral-600">No reports.</div> : null}
    </div>
  );
}
