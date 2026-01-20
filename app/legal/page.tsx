import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Bidra | Legal",
};

export default function LegalHubPage() {
  return (
    <main className="bd-container py-6 pb-14">
      <div className="bd-card p-6 space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Legal</h1>

        <p className="text-sm text-black/70">
          Bidra is an Australian marketplace platform. Bidra is not the seller of items listed by users.
        </p>

        <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-3">
          <div className="text-sm font-extrabold text-[#0b1220]">Policies</div>

          <ul className="list-disc pl-5 text-sm text-black/75 space-y-2">
            <li>
              <Link href="/legal/terms" className="bd-link font-semibold">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="bd-link font-semibold">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/prohibited-items" className="bd-link font-semibold">
                Prohibited Items
              </Link>
            </li>
            <li>
              <Link href="/support" className="bd-link font-semibold">
                Support & Safety
              </Link>
            </li>
          </ul>
        </div>

        <p className="text-xs text-black/50">
          Plain-language legal pages for using Bidra in Australia.
        </p>
      </div>
    </main>
  );
}
