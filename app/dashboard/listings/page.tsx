import { redirect } from "next/navigation";

export default function DashboardListingsPage() {
  redirect("/account#listings");
}
