import { redirect } from "next/navigation";

export default function AliasRedirect() {
  redirect("/auth/login");
}
