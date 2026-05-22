import { PublicContentPage, TopicGrid } from "@/components/public-info-page";

const values = [
  { title: "Simple local buying", body: "Bidra keeps discovery, offers and buy now actions clear so people can move quickly.", href: "/listings", icon: "▣" },
  { title: "Trust first", body: "Profiles, reporting and policy pages are built around safer local marketplace behaviour.", href: "/support", icon: "◇" },
  { title: "Made for Australia", body: "Location and distance tools are designed around suburbs, postcodes and nearby listings.", href: "/how-it-works", icon: "⌂" },
  { title: "Built to grow", body: "Bidra V1 focuses on clean marketplace basics before adding optional advanced tools.", href: "/pricing", icon: "↗" },
];

export default function AboutPage() {
  return (
    <PublicContentPage title="About Bidra" subtitle="A cleaner local marketplace for buying, selling and making offers.">
      <TopicGrid items={values} />
    </PublicContentPage>
  );
}
