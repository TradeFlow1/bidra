import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";

const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { saved?: string };
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/auth/login");

  const saved = String(searchParams?.saved ?? "") === "1";

  async function update(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u?.id) redirect("/auth/login");

    const name = String(formData.get("name") ?? "").trim().slice(0, 60);
    const bio = String(formData.get("bio") ?? "").trim().slice(0, 280);
    const avatarUrl = String(formData.get("avatarUrl") ?? "").trim().slice(0, 500);

    const postcode = String(formData.get("postcode") ?? "").trim().slice(0, 10);
    const suburb = String(formData.get("suburb") ?? "").trim().slice(0, 60);
    const state = String(formData.get("state") ?? "").trim().slice(0, 10);

    const hasPostcode = postcode.length > 0;
    const hasSuburb = suburb.length > 0;
    const hasState = state.length > 0;

    // Rule: postcode OR (suburb + state). No street address.
    if (!hasPostcode && !(hasSuburb && hasState)) {
      redirect("/profile?saved=0");
    }

    // If suburb entered, state must be present (even if postcode exists)
    if (hasSuburb && !hasState) {
      redirect("/profile?saved=0");
    }

    await prisma.user.update({
      where: { id: u.id },
      data: {
        name: name || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        postcode: hasPostcode ? postcode : null,
        suburb: hasSuburb ? suburb : null,
        state: hasState ? state : null,
        country: "AU",
      },
    });

    redirect("/profile?saved=1");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-center">Account settings</h1>

      <div className="mt-5 flex justify-center gap-3">
        <a
          href="/forgot-password"
          className="inline-flex items-center rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
        >
          Reset password
        </a>
        <a
          href="/logout"
          className="inline-flex items-center rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/5"
        >
          Log out
        </a>
      </div>

      {saved ? (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          <div className="font-semibold">Profile updated successfully.</div>
          <div className="mt-1">
            <a href="/profile" className="underline font-medium hover:opacity-90">
              Dismiss
            </a>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        <Card>
          <div className="text-sm text-neutral-600">Email</div>
          <div className="font-semibold">{dbUser.email}</div>
          <div className="mt-2 text-sm">
            Verification:{" "}
            {dbUser.emailVerified ? (
              <span className="text-green-700 font-medium">Verified</span>
            ) : (
              <span className="text-amber-700 font-medium">Not verified</span>
            )}
          </div>
        </Card>

        <Card>
          <form action={update} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Display name</label>
              <Input name="name" defaultValue={dbUser.name ?? ""} placeholder="e.g. Jordan" />
            </div>

            <div>
              <label className="text-sm font-medium">Bio (optional)</label>
              <Input name="bio" defaultValue={(dbUser as any).bio ?? ""} placeholder="A short intro (optional)" />
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold">Location</div>
              <div className="mt-1 text-sm text-black/70">
                Use <span className="font-semibold">postcode</span> OR <span className="font-semibold">suburb + state</span>. (No street address)
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium">Postcode</label>
                  <Input name="postcode" defaultValue={(dbUser as any).postcode ?? ""} placeholder="e.g. 4301" />
                </div>

                <div className="hidden sm:flex items-center justify-center text-xs text-black/50">
                  OR
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Suburb</label>
                    <Input name="suburb" defaultValue={(dbUser as any).suburb ?? ""} placeholder="e.g. Redbank Plains" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">State</label>
                    <select
                      name="state"
                      defaultValue={(dbUser as any).state ?? ""}
                      className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black/30"
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Avatar URL (optional)</label>
              <Input name="avatarUrl" defaultValue={(dbUser as any).avatarUrl ?? ""} placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full bg-black text-white border-black hover:opacity-90">
              Save changes
            </Button>

            <div className="text-xs text-neutral-600 text-center">
              Privacy-first: we only store general area (suburb/state/postcode). No street addresses.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
