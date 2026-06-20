"use client";

import { usePathname } from "next/navigation";
import { SaveSearchButton } from "@/components/saved-searches";

export default function ListingsSavedSearchToolbar() {
  const pathname = usePathname();

  if (pathname !== "/listings") return null;

  return (
    <div className="sticky bottom-4 z-20 mx-auto mt-4 flex w-full max-w-[1440px] justify-end px-4 pb-4 sm:px-6 lg:px-10">
      <div className="rounded-[24px] border border-[#C7D2FE] bg-white/95 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur">
        <SaveSearchButton className="h-12 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black !text-white shadow-[0_14px_30px_rgba(79,70,229,0.22)]" />
      </div>
    </div>
  );
}
