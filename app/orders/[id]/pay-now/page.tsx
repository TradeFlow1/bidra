import { redirect } from "next/navigation";

export default function PayNowRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/orders/${params.id}/pay`);
}
