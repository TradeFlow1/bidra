import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function SellPage() {
  const session = await getServerSession(authOptions);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    redirect("/auth/login?next=/sell");
  }

  // If your app's actual create form route is different, we’ll adjust after test.
  redirect("/sell/new");
}