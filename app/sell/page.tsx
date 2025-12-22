import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, Input } from "@/components/ui";

export default async function SellPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, send user to login page
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
            <Input
              name="title"
              placeholder="e.g. iPhone 14 Pro"
              required
            />
          </div>

          <div>
            <label className="text-sm">Price (AUD)</label>
            <Input
              name="price"
              placeholder="100"
              inputMode="decimal"
              required
            />
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
