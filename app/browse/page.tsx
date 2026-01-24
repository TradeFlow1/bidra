import { redirect } from "next/navigation";

export default function BrowsePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = new URLSearchParams();

  if (searchParams) {
    for (const k of Object.keys(searchParams)) {
      const v = searchParams[k];
      if (typeof v === "string" && v.trim()) sp.set(k, v);
      else if (Array.isArray(v) && v.length) {
        const first = String(v[0] ?? "").trim();
        if (first) sp.set(k, first);
      }
    }
  }

  const qs = sp.toString();
  redirect(qs ? `/listings?${qs}` : "/listings");
}
