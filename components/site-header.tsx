import SiteHeaderClient from "./site-header-client";
import { auth } from "@/lib/auth";
import { getNotificationCounts } from "@/lib/notifications";

export default async function SiteHeader() {
  const session = await auth();

  let notificationCount = 0;
  try {
    const userId = (session?.user as any)?.id;
    if (userId) {
      const counts = await getNotificationCounts(userId);
      notificationCount = Number(counts.total || 0);
    }
  } catch {
    notificationCount = 0;
  }

  return <SiteHeaderClient session={session} notificationCount={notificationCount} />;
}
