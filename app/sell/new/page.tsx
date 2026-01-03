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
      <main className="bd-container" style={{ paddingTop: 32, paddingBottom: 32 }}>
        <h1 className="h1" style={{ fontSize: 28 }}>Action required</h1>

        <p className="p" style={{ marginTop: 6 }}>
          You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.
          Please submit feedback to continue creating listings.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={gate.feedbackUrl || "/orders"}
            className="btnPrimary"
          >
            Complete feedback
          </a>

          <a
            href="/orders"
            className="btnPrimary"
          >
            View orders
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="bd-container" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <h1 className="h1" style={{ fontSize: 28 }}>Create a listing</h1>
      <p className="p" style={{ marginTop: 6 }}>
        Add the basics — title, description, category, condition, location, and pricing.
      </p>

      <div className="mt-6">
        <SellNewClient />
      </div>
    </main>
  );
}
