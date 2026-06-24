import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BulkListingPhotoPlanner from "@/components/bulk-listing-photo-planner";
import { BackButton } from "@/components/ui/back-button";
import { ReferencePage, appShell } from "@/components/marketplace-redesign";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BulkListingPrepPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?next=/sell/bulk");

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/sell/new" label="Back to create listing" />
        <section className="mt-4 rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Bulk listing and photo improvements</div>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-6xl">Prepare listings faster</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Plan item rows, photo counts and required details before creating listings one by one. This keeps listing quality high without adding payment, shipping, pickup scheduling or completion workflow.</p>
        </section>

        <div className="mt-5"><BulkListingPhotoPlanner /></div>
      </div>
    </ReferencePage>
  );
}
