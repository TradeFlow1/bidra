import Link from "next/link";
import { Card } from "@/components/ui";

export default function PricingPage() {
  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pricing</h1>
      <p className="text-neutral-700">
        Fees may change over time — we’ll always show costs clearly before you commit.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="font-semibold">Browse</div>
          <div className="mt-2 text-sm text-neutral-700">Free to browse and watch listings.</div>
        </Card>
        <Card>
          <div className="font-semibold">Sell</div>
          <div className="mt-2 text-sm text-neutral-700">Promotional fees may apply (see Fees policy).</div>
          <Link href="/legal/fees" className="mt-2 inline-block text-sm hover:underline">View fees</Link>
        </Card>
        <Card>
          <div className="font-semibold">Buy</div>
          <div className="mt-2 text-sm text-neutral-700">Secure checkout where available.</div>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link href="/listings" className="rounded-md bg-black text-white px-4 py-2 text-sm font-medium">Browse</Link>
        <Link href="/sell" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50">Sell</Link>
      </div>
    </div>
  );
}
