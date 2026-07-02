import Link from "next/link";

export function BidraSellPrompt() {
  return (
    <section className="bidra-sell-prompt" aria-label="Sell quickly">
      <div>
        <h2>Ready to sell?</h2>
        <p>Post your listing in minutes, choose Buy Now or offers, and manage replies in one place.</p>
      </div>
      <Link href="/sell/new" className="bidra-sell-prompt__action">
        Start selling
      </Link>
    </section>
  );
}
