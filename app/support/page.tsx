"use client";
import Link from "next/link";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Support & Safety</h1>
      <p className="mt-2 text-gray-600">
        Need help? We’re here to assist with account or order issues and keep our marketplace safe for everyone.
      </p>
      <ul className="mt-6 space-y-4 text-gray-600">
        <li><strong>Report issues:</strong> Use in‑product reporting when you see unsafe behaviour or policy violations.</li>
        <li><strong>Contact support:</strong> Reach out for account access or order queries.</li>
        <li><strong>Send feedback:</strong> Share product ideas or improvements.</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/contact" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Contact support</Link>
        <Link href="/feedback" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Send feedback</Link>
        <Link href="/legal/prohibited-items" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">Prohibited items</Link>
      </div>
    </main>
  );
}
