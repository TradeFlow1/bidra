import { redirect } from "next/navigation";

export const metadata = { title: "Bidra | Privacy Policy" };

export default function Page() {
  redirect("/legal/privacy");
}
