import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  let session: any = null;

  try {
    session = await auth();
  } catch (_err) {
    // If session fetch fails for any reason, treat as not logged in.
    session = null;
  }

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Create a listing</h1>

      <div className="rounded-md border p-4 space-y-4">
        <p className="text-sm text-neutral-700">
          You are logged in as <span className="font-medium">{session.user.email}</span>
        </p>

        {/* Temporary simple form to confirm /sell loads correctly.
            Next step is wiring the submit to Prisma create. */}
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm">Title</label>
            <input
              name="title"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. iPhone 14 Pro"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Price (AUD)</label>
            <input
              name="price"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="100"
              inputMode="decimal"
            />
          </div>

          <button
            type="button"
            className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Create listing (next step)
          </button>

          <p className="text-xs text-neutral-600">
            If you can see this page, /sell routing + auth gating is fixed. Next we will wire the submit to the database.
          </p>
        </form>
      </div>
    </div>
  );
}
