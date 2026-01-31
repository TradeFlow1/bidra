import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign in — Bidra",
};

export default function Page() {
  redirect("/auth/login");
}
