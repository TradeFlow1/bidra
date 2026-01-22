import { redirect, notFound } from "next/navigation";

const FT_ENABLED =
  process.env.NEXT_PUBLIC_FT_ENABLED === "1" ||
  process.env.NEXT_PUBLIC_FT_ENABLED === "true";

export default function FeedbackAliasPage() {
  if (!FT_ENABLED) notFound();
  redirect("/ft/feedback");
}
