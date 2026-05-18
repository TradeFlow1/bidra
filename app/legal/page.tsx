import { ArticleList, PublicContentPage, TopicGrid } from "@/components/public-info-page";

const legalTopics = [
  { title: "Terms and privacy", body: "How Bidra works, your responsibilities, and platform rules.", href: "/legal/terms", icon: "▤" },
  { title: "Fees", body: "Current fees for buying, selling and offers.", href: "/legal/fees", icon: "$" },
  { title: "Prohibited items", body: "Items and listing types that cannot be listed.", href: "/legal/prohibited-items", icon: "!" },
  { title: "Disputes", body: "What to do when a trade does not go to plan.", href: "/disputes", icon: "◇" },
];

const legalDocs = [
  { title: "Terms of Use", href: "/legal/terms" },
  { title: "Privacy Policy", href: "/legal/privacy" },
  { title: "Fees", href: "/legal/fees" },
  { title: "Prohibited Items", href: "/legal/prohibited-items" },
  { title: "Disputes", href: "/disputes" },
];

export default function LegalPage() {
  return (
    <PublicContentPage title="Legal" subtitle="Rules, fees and important information for using Bidra.">
      <section>
        <h2 className="text-2xl font-black tracking-tight">Core documents</h2>
        <div className="mt-7">
          <TopicGrid items={legalTopics} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-black tracking-tight">Browse legal pages</h2>
        <div className="mt-7">
          <ArticleList items={legalDocs} />
        </div>
      </section>
    </PublicContentPage>
  );
}
