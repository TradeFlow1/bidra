/* BIDRA_BACK_NAV_ALIAS_PAGE: route alias; canonical public legal prohibited-items page owns visible back navigation */
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProhibitedRedirectPage() {
  redirect("/legal/prohibited-items");
}

