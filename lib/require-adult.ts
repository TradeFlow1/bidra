import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdult() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const age = session.user.age;
  if (!age || age < 18) {
    redirect("/");
  }
}
