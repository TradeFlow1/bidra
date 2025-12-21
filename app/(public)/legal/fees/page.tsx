export default function Page() {
  return (
    <div className="prose max-w-3xl">
      <h1>Fees</h1>
      <p>
        Bidra is in MVP. If seller fees apply, they will be displayed clearly before you publish or transact.
      </p>
      <h2>Current approach</h2>
      <ul>
        <li>Browsing is free.</li>
        <li>Buy-now payments use Stripe (test mode during MVP).</li>
        <li>Fee structures may evolve with premium features.</li>
      </ul>
    </div>
  );
}
