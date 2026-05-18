import { PublicContentPage, TopicGrid } from "@/components/public-info-page";

const pricing = [
  { title: "Free listings", body: "Standard listings are free during Bidra V1.", href: "/sell", icon: "$" },
  { title: "Free browsing", body: "Buyers can browse, save and message without a platform fee.", href: "/listings", icon: "▣" },
  { title: "Optional upgrades later", body: "Future paid features will always show pricing before purchase.", href: "/legal/fees", icon: "↗" },
  { title: "No hidden charges", body: "Fees and marketplace terms are kept in one clear place.", href: "/legal/fees", icon: "◇" },
];

export default function PricingPage() {
  return (
    <PublicContentPage title="Pricing" subtitle="Simple marketplace pricing for Bidra V1.">
      <TopicGrid items={pricing} />
    </PublicContentPage>
  );
}
