import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OrderCompleteRedirect({ params }: { params: { id: string } }) {
  const id = String(params?.id || "").trim();
  if (!id) redirect("/orders");
  redirect("/orders/" + id);
}
