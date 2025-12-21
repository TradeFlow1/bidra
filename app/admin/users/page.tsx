import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Badge } from "@/components/ui";

export default async function AdminUsers() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="grid gap-3">
        {users.map(u => (
          <Card key={u.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{u.name ?? u.email}</div>
                <div className="text-sm text-neutral-600">{u.email}</div>
                <div className="text-xs text-neutral-600">Joined {new Date(u.createdAt).toLocaleString("en-AU")}</div>
              </div>
              <div className="flex gap-2">
                <Badge>{u.role}</Badge>
                {u.emailVerified ? <Badge>Verified</Badge> : <Badge>Unverified</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
