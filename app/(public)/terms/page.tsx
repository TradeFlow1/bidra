import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TermsRedirectPage() {
  redirect("/legal/terms");
}
