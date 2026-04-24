export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login?next=/dashboard");

  redirect("/dashboard");
}
