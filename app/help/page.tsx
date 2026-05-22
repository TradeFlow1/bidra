import { ArticleList, PublicContentPage, SearchBox, TopicGrid } from "@/components/public-info-page";

const topics = [
  { title: "Getting started", body: "Learn how Bidra works", href: "/how-it-works", icon: "▣" },
  { title: "Buying safely", body: "Tips for a safe experience", href: "/support", icon: "◇" },
  { title: "Account & settings", body: "Manage your account", href: "/account", icon: "⚙" },
  { title: "Selling on Bidra", body: "How to list and sell", href: "/sell", icon: "⌂" },
];

const articles = [
  { title: "How do I buy an item?", href: "/help#buy" },
  { title: "How do I make an offer?", href: "/help#offer" },
  { title: "How do I set up an alert?", href: "/notifications" },
  { title: "How do I edit my listing?", href: "/dashboard/listings" },
  { title: "How do I change my listing?", href: "/dashboard/listings" },
  { title: "How do I contact a seller?", href: "/messages" },
];

export default function HelpPage() {
  return (
    <>
      <PublicContentPage title="Help Centre" subtitle="How can we help you?">
        <SearchBox placeholder="Search help articles..." />

        <section className="mt-10">
          <h2 className="text-2xl font-black tracking-tight">Popular topics</h2>
          <div className="mt-7">
            <TopicGrid items={topics} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black tracking-tight">Browse all articles</h2>
          <div className="mt-7">
            <ArticleList items={articles} />
          </div>
        </section>
      </PublicContentPage>
    </>
  );
}
