import { ArticleList, PublicContentPage, TopicGrid } from "@/components/public-info-page";

const steps = [
  { title: "Browse nearby", body: "Use location, category and price filters to find items around you.", href: "/listings", icon: "⌕" },
  { title: "Buy now or offer", body: "Choose a listed price or make a fair offer to the seller.", href: "/listings", icon: "$" },
  { title: "Message safely", body: "Keep conversations on Bidra so details are easy to track.", href: "/messages", icon: "○" },
  { title: "Arrange handover", body: "Agree on payment, pickup and handover directly with the other user.", href: "/support", icon: "◇" },
];

const links = [
  { title: "Start browsing listings", href: "/listings" },
  { title: "Sell an item", href: "/sell" },
  { title: "Read safety tips", href: "/support" },
  { title: "Review marketplace rules", href: "/legal/prohibited-items" },
];

export default function HowItWorksPage() {
  return (
    <PublicContentPage title="How Bidra works" subtitle="Find, offer, buy and sell with fewer steps.">
      <TopicGrid items={steps} />
      <section className="mt-12">
        <h2 className="text-2xl font-black tracking-tight">Useful links</h2>
        <div className="mt-7">
          <ArticleList items={links} />
        </div>
      </section>
    </PublicContentPage>
  );
}
