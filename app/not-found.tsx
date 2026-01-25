import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <div className="bd-card p-6">
          <div className="text-3xl font-extrabold tracking-tight bd-ink">Page not found</div>
          <p className="mt-2 text-sm bd-ink2">
            The page you’re looking for doesn’t exist — it may have been moved or removed.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/" className="bd-btn bd-btn-primary text-center">Go home</Link>
            <Link href="/listings" className="bd-btn bd-btn-primary text-center">Browse listings</Link>
            <Link href="/messages" className="bd-btn bd-btn-ghost text-center">Messages</Link>
            <Link href="/support" className="bd-btn bd-btn-ghost text-center">Support</Link>
          </div>

          <div className="mt-4 text-xs bd-ink2">
            Tip: If you expected to be signed in, try <Link className="bd-link font-semibold" href="/auth/login">logging in</Link> and then return here.
          </div>
        </div>
      </div>
    </main>
  );
}
