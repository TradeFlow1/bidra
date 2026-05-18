import { PublicContentPage, TopicGrid } from "@/components/public-info-page";

const feedbackOptions = [
  { title: "Report a listing", body: "Flag prohibited, misleading or unsafe marketplace content.", href: "/ft/report", icon: "!" },
  { title: "Send product feedback", body: "Tell us what should be clearer or easier to use.", href: "/ft/feedback", icon: "◇" },
  { title: "Get help", body: "Find help articles and support guidance.", href: "/help", icon: "?" },
  { title: "Dispute guidance", body: "Understand what to do when a trade goes wrong.", href: "/disputes", icon: "▤" },
];

export default function FeedbackPage() {
  return (
    <PublicContentPage title="Feedback" subtitle="Help us improve Bidra and keep the marketplace safe.">
      <TopicGrid items={feedbackOptions} />
    </PublicContentPage>
  );
}
