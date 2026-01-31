export const dynamic = "force-dynamic";

export const metadata = { title: "Privacy Policy — Bidra" };

function H2({ children }: { children: any }) {
  return <h2 className="text-lg font-extrabold bd-ink">{children}</h2>;
}
function H3({ children }: { children: any }) {
  return <h3 className="text-base font-extrabold bd-ink">{children}</h3>;
}

export default function PrivacyPage() {
  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Privacy Policy</h1>
          <p className="bd-ink2 leading-7">
            Bidra is privacy-first. We collect the minimum data needed to run an Australian marketplace,
            keep users safe, and meet basic legal obligations.
          </p>
          <p className="text-sm bd-ink2">
            This policy explains what we collect, why we collect it, how we store it, and the choices you have.
          </p>
        </header>

        <div className="rounded-2xl border bd-bd bg-white p-6 space-y-8">
          <section className="space-y-2">
            <H2>1) Information we collect</H2>
            <div className="space-y-3 text-sm bd-ink2 leading-7">
              <div>
                <H3>Account & identity basics</H3>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Email address and a display name/username.</li>
                  <li>Date of birth (to enforce 18+ accounts).</li>
                  <li>Optional profile info you choose to add (bio, avatar/photo if enabled).</li>
                </ul>
              </div>

              <div>
                <H3>Location</H3>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Suburb, state, and postcode (used for browsing, listings, and safer meetups).</li>
                  <li>We do not require a street address to use Bidra.</li>
                </ul>
              </div>

              <div>
                <H3>Marketplace activity</H3>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Listings you create (photos, title, description, category, price, sale type).</li>
                  <li>Offers, Buy Now purchases, orders, and feedback.</li>
                  <li>Messages you send and receive inside Bidra.</li>
                  <li>Reports and moderation actions (to keep the platform safe).</li>
                </ul>
              </div>

              <div>
                <H3>Technical data</H3>
                <ul className="mt-2 list-disc pl-6 space-y-1">
                  <li>Basic logs (e.g., IP address, device/browser info) for security and fraud prevention.</li>
                  <li>Cookies/session data to keep you logged in and protect your account.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <H2>2) Why we collect and use information</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>To create and manage your account, and to enforce our 18+ policy.</li>
              <li>To operate core marketplace features (listings, offers, orders, messaging, feedback).</li>
              <li>To prevent fraud, investigate abuse, and enforce safety rules (including prohibited items).</li>
              <li>To maintain the site, diagnose issues, and improve reliability and usability.</li>
              <li>To respond to support requests and communicate important service notices.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>3) What we don’t do</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>We do not sell your personal data.</li>
              <li>We do not require a street address to browse or use core features.</li>
              <li>We do not intentionally collect unnecessary sensitive information.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>4) Sharing and disclosure</H2>
            <div className="text-sm bd-ink2 leading-7 space-y-3">
              <p>
                We share information only when needed to run the service, keep people safe, or comply with law.
                Examples include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service providers (hosting, email delivery, security tooling) under confidentiality and access controls.</li>
                <li>Other users, when you choose to interact (e.g., your listing content, your public display name).</li>
                <li>Law enforcement or regulators when required or reasonably necessary to prevent serious harm or fraud.</li>
              </ul>
              <p>
                Messages are private between participants, but may be reviewed by Bidra in response to a report,
                suspected abuse, or legal request.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <H2>5) Storage, security, and retention</H2>
            <div className="text-sm bd-ink2 leading (leading-7) space-y-3">
              <p>
                We use reasonable security measures to protect your data (access controls, monitoring, and secure
                infrastructure). No system is perfect, but we design to minimise risk and collect less in the first place.
              </p>
              <p>
                We keep data only as long as needed for the purposes above, including dispute handling, fraud prevention,
                and enforcement records. We may retain limited records where required by law or to protect the platform.
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <H2>6) Your choices</H2>
            <ul className="mt-2 list-disc pl-6 text-sm bd-ink2 leading-7 space-y-1">
              <li>You can update your profile details in your account settings.</li>
              <li>You can choose what you include in listings and messages (please avoid oversharing).</li>
              <li>You can contact us to ask about access or corrections to your account information.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <H2>7) Contact</H2>
            <p className="text-sm bd-ink2 leading-7">
              For privacy questions or requests, use the Contact page. We’ll respond as soon as reasonably possible.
            </p>
          </section>

          <p className="text-xs bd-ink2 opacity-70">
            This policy may be updated from time to time. If changes are significant, we’ll take reasonable steps to notify users.
          </p>
        </div>
      </div>
    </main>
  );
}
