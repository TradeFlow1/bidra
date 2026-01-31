import { redirect } from "next/navigation";

export const metadata = {
  title: "Logout — Bidra",
};

export default function Page() {
  redirect("/logout");
}
