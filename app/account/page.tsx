export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth();

  // Keep /account route, but make /dashboard the single canonical "My Account" hub.
  if (!session?.user?.id) redirect("/auth/login?next=/dashboard");

  redirect("/dashboard");
}
