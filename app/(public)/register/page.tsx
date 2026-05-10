/* BIDRA_BACK_NAV_ALIAS_PAGE: route alias; canonical auth register page owns visible back navigation */
import { redirect } from "next/navigation";

export const metadata = {
  title: "Register â€” Bidra",
};

export default function Page() {
  redirect("/auth/register");
}

