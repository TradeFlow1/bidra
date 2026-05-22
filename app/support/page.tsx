import { ArticleList, PublicContentPage, SearchBox, TopicGrid } from "@/components/public-info-page";

const topics = [
  { title: "Meet in safe places", body: "Choose public locations and avoid risky handovers.", href: "/support#handover", icon: "◇" },
  { title: "Check listings", body: "Review photos, price, location and seller details before agreeing.", href: "/support#listings", icon: "▣" },
  { title: "Keep chats on Bidra", body: "Messages on platform are easier to review if issues arise.", href: "/messages", icon: "○" },
  { title: "Report problems", body: "Tell us about scams, prohibited items or unsafe behaviour.", href: "/feedback", icon: "!" },
];

const articles = [
  { title: "Safety tips for buyers", href: "/support#buyers" },
  { title: "Safety tips for sellers", href: "/support#sellers" },
  { title: "How to report a listing", href: "/feedback" },
  { title: "Dispute guidance", href: "/disputes" },
];

export default function SupportPage() {
  return (
    <PublicContentPage title="Support" subtitle="Help, safety and reporting for Bidra users.">
      <SearchBox placeholder="Search support..." />
      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight">Safety topics</h2>
        <div className="mt-7">
          <TopicGrid items={topics} />
        </div>
      </section>
      <section className="mt-12">
        <h2 className="text-2xl font-black tracking-tight">Support articles</h2>
        <div className="mt-7">
          <ArticleList items={articles} />
        </div>
      </section>
    </PublicContentPage>
  );
}
