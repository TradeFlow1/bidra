import { redirect } from "next/navigation";

export const metadata = { title: "Bidra | Terms of Use" };

export default function Page() {
  redirect("/legal/terms");
}
