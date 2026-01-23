import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";

type AdminUserRow = {
  id: string;
  email: string;
  username: string;
  role: string;
  isActive: boolean;
  policyStrikes: number;
  policyBlockedUntil: Date | null;
  createdAt: Date;
};

export default async function AdminUsers() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const users = (await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      policyStrikes: true,
      policyBlockedUntil: true,
      createdAt: true,
    },
  })) as AdminUserRow[];

  const backTo = "/admin/users";

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="grid gap-3">
        {users.map((u: AdminUserRow) => (
          <Card key={u.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">
                  <Link className="hover:underline" href={"/profile?user=" + u.id}>
                    {u.username}
                  </Link>
                </div>
                <div className="text-sm text-neutral-600">{u.email}</div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  <Badge>{u.role}</Badge>
                  <Badge>{u.isActive ? "ACTIVE" : "INACTIVE"}</Badge>
                  <Badge>Strikes {u.policyStrikes}</Badge>
                  {u.policyBlockedUntil ? (
                    <Badge>Blocked until {new Date(u.policyBlockedUntil).toLocaleString("en-AU")}</Badge>
                  ) : null}
                </div>

                <div className="mt-2 text-xs text-neutral-600">
                  Created {new Date(u.createdAt).toLocaleString("en-AU")}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {u.policyStrikes > 0 ? (
                  <form action="/api/admin/users/unstrike" method="post">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="backTo" value={backTo} />
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50"
                      title="Remove one policy strike"
                    >
                      Unstrike
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
