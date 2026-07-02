"use client";
import { usePathname } from "next/navigation";
import { SaveSearchButton } from "@/components/saved-searches";
export default function ListingsSavedSearchToolbar() {
    const pathname = usePathname();
    if (pathname !== "/listings")
        return null;
    return (<div>
      <div>
        <SaveSearchButton />
      </div>
    </div>);
}
