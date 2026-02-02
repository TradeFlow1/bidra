export default function FeesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Fees</h1>
      <p className="mt-3 text-base text-black/70">
        Bidra is a marketplace platform. Fees help cover platform operations, support, safety tooling, and ongoing improvements.
        Any applicable fees are shown in-app before you confirm actions.
      </p>

      <section className="mt-8 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Listing fees</h2>
        <p className="mt-3 text-black/75">
          Creating a listing is generally free unless the product experience explicitly shows a paid option at the time you list.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Success fees</h2>
        <p className="mt-3 text-black/75">
          For completed <strong>Buy Now</strong> sales, Bidra may charge a seller success fee.
          <strong> The fee shown in the Bidra UI at the time of sale is the source of truth.</strong>
        </p>
        <ul className="mt-3 list-disc pl-5 text-black/75 space-y-2">
          <li>Typical structure: a small percentage of the sale price (for example, 7%).</li>
          <li>Fees (if any) are displayed before confirmation, and are recorded on the order.</li>
          <li>Timed Offers may have different fee rules depending on how the sale is completed.</li>
        </ul>
        <p className="mt-3 text-sm text-black/60">
          Note: Fee structures can evolve over time as Bidra adds new features. We will always display fees clearly in-app.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
        <h2 className="text-xl font-semibold">Payment processing</h2>
        <p className="mt-3 text-black/75">
          If Bidra integrates third-party payment providers, those providers may charge processing fees under their own terms.
          Bidra does not hold pooled customer funds unless explicitly stated in-product and implemented through appropriate providers.
        </p>
      </section>

      <section className="mt-10 text-sm text-black/60">
        <p>
          See also: <a className="underline" href="/legal/terms">Terms</a> and{" "}
          <a className="underline" href="/how-it-works">How it works</a>.
        </p>
      </section>
    </main>
  );
}
