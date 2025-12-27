import SellNewClient from "./sell-new-client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";

export const dynamic = "force-dynamic";

export default async function SellNewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login?next=/sell/new");
  }

  const gate = await getFeedbackGate(session.user.id, 48);

  if (gate.blocked) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Action required</h1>

        <p className="mt-2 text-sm opacity-80">
          You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.
          Please submit feedback to continue creating listings.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={gate.feedbackUrl || "/orders"}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Complete feedback
          </a>

          <a
            href="/orders"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            View orders
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Create a listing</h1>
      <p className="mt-2 text-sm opacity-80">
        Add the basics — title, description, category, condition, location, and price.
      </p>

      <div className="mt-6">
        <SellNewClient />
      </div>
    </main>
  );
}