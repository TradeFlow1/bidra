import { redirect } from "next/navigation";

export default function AliasRedirect() {
  redirect("/orders/[id]/pay");
}
