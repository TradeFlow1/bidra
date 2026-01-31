import { redirect } from "next/navigation";

export const metadata = {
  title: "Register — Bidra",
};

export default function Page() {
  redirect("/auth/register");
}
