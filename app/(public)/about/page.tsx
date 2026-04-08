import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="prose max-w-3xl">
      <h1>About Bidra</h1>
      <p>
        Bidra is an Australian-focused marketplace built from scratch with original design and copy.
        List items for buy-now or receive offers, message sellers, and complete pickups with confidence.
      </p>
      <h2>Marketplace principles</h2>
      <ul>
        <li>Clarity: listings should be honest and detailed</li>
        <li>Fairness: offers reduce back-and-forth and make intent clear</li>
        <li>Safety: policies and reporting help reduce risky transactions</li>
      </ul>
      <p>
        Read <Link href="/legal/safety">Safety tips</Link> before meeting in person or arranging pickup.
      </p>
    </div>
  );
}

