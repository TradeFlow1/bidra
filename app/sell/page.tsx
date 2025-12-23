import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, Input } from "@/components/ui";

export default async function SellPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Create a listing</h1>
        <Link className="text-sm underline" href="/listings">
          Back to listings
        </Link>
      </div>

      <Card>
        <form className="space-y-4" action="/api/listings/create" method="post">
          <div>
            <label className="text-sm">Title</label>
            <Input name="title" placeholder="e.g. iPhone 14 Pro" required />
          </div>

          <div>
            <label className="text-sm">Price (AUD)</label>
            <Input name="price" placeholder="100" inputMode="decimal" required />
          </div>

          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Create listing
          </button>

          <p className="text-xs text-neutral-600">
            (This form posts to <code>/api/listings/create</code>. If that route
            doesn’t exist yet, the button won’t work—but the page should load
            without crashing.)
          </p>
        </form>
      </Card>
    </div>
  );
}
