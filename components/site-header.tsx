import { auth } from "@/lib/auth";
import SiteHeaderClient from "@/components/site-header-client";

export default async function SiteHeader() {
  const session = await auth();
  const signedIn = !!session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const displayName = (session?.user as any)?.name ?? null;

  return <SiteHeaderClient signedIn={signedIn} isAdmin={isAdmin} displayName={displayName} />;
}
