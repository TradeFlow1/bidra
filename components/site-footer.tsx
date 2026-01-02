import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 md:grid-cols-3 text-sm text-gray-600">
        <div>
          <div className="font-semibold text-gray-900 mb-2">Bidra</div>
          <p>
            Bidra is an Australian online marketplace where individuals list
            items for sale or receive offers. Bidra is a platform only and is
            not the seller of items listed.
          </p>
        </div>

        <div>
          <div className="font-semibold text-gray-900 mb-2">Trust & Safety</div>
          <ul className="space-y-1">
            <li>
              <Link href="/legal/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/legal/terms">Terms of Service</Link>
            </li>
            <li>
              <Link href="/legal/prohibited-items">Prohibited Items</Link>
            </li>
            <li>
              <Link href="/support">Support & Safety</Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold text-gray-900 mb-2">Buy & Sell Safely</div>
          <p>
            Always meet in public places, inspect items before completing a
            transaction, and use Bidra messaging to keep records of
            communication.
          </p>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bidra. All rights reserved.
      </div>
    </footer>
  );
}
