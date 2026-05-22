import { PublicContentPage, TopicGrid } from "@/components/public-info-page";

const contactOptions = [
  { title: "General support", body: "Get help with your account, listings or messages.", href: "/support", icon: "○" },
  { title: "Report a problem", body: "Tell us about unsafe behaviour, bugs or suspicious listings.", href: "/feedback", icon: "!" },
  { title: "Legal questions", body: "Review Bidra terms, privacy, fees and item rules.", href: "/legal", icon: "▤" },
  { title: "Start selling", body: "Create a listing and reach local buyers.", href: "/sell", icon: "↗" },
];

export default function ContactPage() {
  return (
    <PublicContentPage title="Contact Bidra" subtitle="Choose the fastest way to get help.">
      <TopicGrid items={contactOptions} />
    </PublicContentPage>
  );
}
