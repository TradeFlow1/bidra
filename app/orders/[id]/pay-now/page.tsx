import { redirect } from "next/navigation";

export default function AliasRedirect({ params }: { params: { id: string } }) {
  redirect(`/orders/${params.id}/pay`);
}
