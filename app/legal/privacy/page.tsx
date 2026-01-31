export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Policy — Bidra" };

export default function PrivacyPage() {
  return (
    <main className="bd-container py-8 pb-14">
      <div className="bd-card p-6 space-y-5 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>

        <p className="text-sm text-black/70">
          Bidra is privacy-first. We collect only the information required to operate
          an Australian marketplace and keep users safe.
        </p>

        <section>
          <h2 className="font-extrabold">Information we collect</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>Account details such as email and display name</li>
            <li>Date of birth to enforce 18+ access</li>
            <li>General location (suburb/state/postcode)</li>
            <li>Listings, offers, messages, and safety reports</li>
          </ul>
        </section>

        <section>
          <h2 className="font-extrabold">What we don’t do</h2>
          <ul className="list-disc pl-5 text-sm text-black/70 space-y-1">
            <li>No selling of personal data</li>
            <li>No requirement for street addresses</li>
            <li>No unnecessary sensitive data collection</li>
          </ul>
        </section>

        <p className="text-xs text-black/50">
          For privacy questions, contact Bidra via the Contact page.
        </p>
      </div>
    </main>
  );
}
