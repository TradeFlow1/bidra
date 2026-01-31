import FeedbackClient from "./feedback-client";

export const metadata = { title: "Feedback — Bidra" };

export default function FeedbackPage() {
  return (
    <main className="bd-shell py-10">
      <FeedbackClient />
    </main>
  );
}
