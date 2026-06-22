import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/ui/back-button";
import { AppPanel, ReferencePage, appShell } from "@/components/marketplace-redesign";
import WantedAdForm from "@/components/wanted-ad-form";

export const dynamic = "force-dynamic";

function buildDefaultLocation(user: { suburb?: string | null; state?: string | null; postcode?: string | null } | null) {
  if (!user) return "";
  const suburb = String(user.suburb || "").trim();
  const state = String(user.state || "").trim().toUpperCase();
  const postcode = String(user.postcode || "").trim();
  return [suburb, state, postcode].filter(Boolean).join(" ");
}

export default async function NewWantedAdPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?next=/wanted/new");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suburb: true, state: true, postcode: true },
  });

  return (
    <ReferencePage>
      <div className={appShell + " py-5 sm:py-7"}>
        <BackButton href="/wanted" label="Back to wanted ads" />
        <section className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,760px)_320px] lg:items-start lg:justify-center">
          <div>
            <div className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-5 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B4DFF]">Wanted ads</div>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-[#07152E] sm:text-5xl">Post what you want to buy</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#36506F] sm:text-base">Tell local sellers what you are looking for. Sellers can create a normal Bidra listing if they have a matching item.</p>
            </div>
            <div className="mt-4"><WantedAdForm defaultLocation={buildDefaultLocation(user)} /></div>
          </div>
          <AppPanel>
            <h2 className="text-xl font-black tracking-tight text-[#07152E]">Good wanted ads include</h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#526173]"><li>Brand, model, size or specs.</li><li>Condition you will consider.</li><li>Your suburb or pickup range.</li><li>Budget range if useful.</li><li>Whether pickup, delivery or postage works.</li></ul>
          </AppPanel>
        </section>
      </div>
    </ReferencePage>
  );
}
