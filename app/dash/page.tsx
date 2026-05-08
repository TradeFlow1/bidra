/* BIDRA_BACK_NAV_ALIAS_PAGE: route alias; canonical dashboard page owns visible back navigation */
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashAliasPage() {
  redirect("/dashboard");
}
