import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, Input } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SellPage() {
  // If NextAuth/env is misconfigured, this page should never hard-crash.
  let session: any = null;

  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    // If session lookup fails, send to login instead of "Something went wrong"
    redirect("/auth/login");
  }

  if (!session || !session.user?.email) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create a listing</h1>

      <Card>
        <form className="space-y-4">
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
            className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Create listing
          </button>
        </form>
      </Card>
    </div>
  );
}
