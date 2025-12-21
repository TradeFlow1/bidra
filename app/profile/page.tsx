import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";

const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/auth/login");

  async function update(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u) redirect("/auth/login");

    const name = String(formData.get("name") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

    await prisma.user.update({
      where: { id: u.id },
      data: {
        name: name || null,
        location: location || null,
        avatarUrl: avatarUrl || null
      }
    });

    redirect("/profile");
  }

  return (
    <div className="max-w-xl flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card>
        <div className="text-sm text-neutral-600">Email</div>
        <div className="font-semibold">{dbUser.email}</div>
        <div className="mt-2 text-sm">
          Verification:{" "}
          {dbUser.emailVerified ? <span className="text-green-700 font-medium">Verified</span> : <span className="text-amber-700 font-medium">Not verified</span>}
        </div>
      </Card>

      <Card>
        <form action={update} className="flex flex-col gap-3">
          <label className="text-sm">Display name</label>
          <Input name="name" defaultValue={dbUser.name ?? ""} placeholder="e.g. Jordan" />

          <label className="text-sm">State/Territory</label>
          <select name="location" defaultValue={dbUser.location ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
            <option value="">Prefer not to say</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="text-sm">Avatar URL (optional)</label>
          <Input name="avatarUrl" defaultValue={dbUser.avatarUrl ?? ""} placeholder="https://..." />

          <Button type="submit" className="bg-black text-white border-black hover:opacity-90">Save</Button>
          <div className="text-xs text-neutral-600">MVP note: ratings are planned; profile currently stores basic info only.</div>
        </form>
      </Card>
    </div>
  );
}
