import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function SellEntryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?next=/sell/new");
  }

  redirect("/sell/new");
}
