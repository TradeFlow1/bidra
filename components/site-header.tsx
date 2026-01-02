import SiteHeaderClient from "./site-header-client";
import { auth } from "@/lib/auth";

export default async function SiteHeader() {
  const session = await auth();
  return <SiteHeaderClient session={session} />;
}
