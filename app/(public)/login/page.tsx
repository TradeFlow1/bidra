/* BIDRA_BACK_NAV_ALIAS_PAGE: route alias; canonical auth login page owns visible back navigation */
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login — Bidra",
};

export default function Page() {
  redirect("/auth/login");
}
