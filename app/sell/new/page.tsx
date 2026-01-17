import SellNewClient from "./sell-new-client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeedbackGate } from "@/lib/feedback-gate";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function buildDefaultLocation(u: { suburb?: string | null; state?: string | null; postcode?: string | null }) {
  const parts: string[] = [];
  const suburb = (u.suburb || "").trim();
  const state = (u.state || "").trim();
  const postcode = (u.postcode || "").trim();

  if (suburb) parts.push(suburb);

  const tail: string[] = [];
  if (state) tail.push(state.toUpperCase());
  if (postcode) tail.push(postcode);

  if (tail.length) {
    if (parts.length) parts[0] = parts[0] + ", " + tail.join(" ");
    else parts.push(tail.join(" "));
  }

  return parts.join("");
}

export default async function SellNewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login?next=/sell/new");
  }

  const gate = await getFeedbackGate(session.user.id, 48);

  if (gate.blocked) {
    return (
      <main className="bd-container py-10">
        <div className="container max-w-5xl">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Action required</h1>

          <p className="mt-2 text-sm bd-ink2">
            You have {gate.pendingCount} pending feedback task(s) older than {gate.graceHours} hours.
            Please submit feedback to continue creating listings.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={gate.feedbackUrl || "/orders"} className="bd-btn bd-btn-primary">
              Complete feedback
            </a>

            <a href="/orders" className="bd-btn bd-btn-ghost">
              View orders
            </a>
          </div>
        </div>
      </main>
    );
  }

  const userRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suburb: true, state: true, postcode: true },
  });

  const defaultLocation = userRow ? buildDefaultLocation(userRow) : "";

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Create a listing</h1>
        <p className="mt-2 text-sm bd-ink2">
          Add the basics — title, description, category, condition, location, and pricing.
        </p>

        <div className="mt-6">
          <SellNewClient defaultLocation={defaultLocation} />
        </div>
      </div>
    </main>
  );
}
