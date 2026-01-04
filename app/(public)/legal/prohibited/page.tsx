export const metadata = {
  title: "Prohibited Items — Bidra",
};

export default function Page() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Prohibited items</h1>

        <p className="mt-3 text-sm bd-ink2">
          For the full, up-to-date prohibited items list, see{" "}
          <a className="bd-link font-semibold" href="/legal/prohibited-items">/legal/prohibited-items</a>.
        </p>

        <div className="mt-6 bd-card p-6">
          <p className="text-sm bd-ink2">
            This page exists for backwards compatibility. Please use the main prohibited items page above.
          </p>
        </div>
      </div>
    </main>
  );
}
