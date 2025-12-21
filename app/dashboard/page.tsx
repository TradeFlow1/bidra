import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user as any;
  if (!user) redirect("/auth/login");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="font-semibold">My listings</div>
          <p className="mt-2 text-sm text-neutral-700">Create, manage, and monitor your listings.</p>
          <Link className="mt-3 inline-block rounded-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90" href="/dashboard/listings">
            Open
          </Link>
        </Card>
        <Card>
          <div className="font-semibold">Orders</div>
          <p className="mt-2 text-sm text-neutral-700">Track purchases and pay for auction wins.</p>
          <Link className="mt-3 inline-block rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50" href="/orders">
            View orders
          </Link>
        </Card>
      </div>
    </div>
  );
}
