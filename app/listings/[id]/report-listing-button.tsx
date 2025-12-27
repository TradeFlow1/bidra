"use client";

import ReportListing from "@/components/report-listing";

export default function ReportListingButton({ listingId }: { listingId: string }) {
  return <ReportListing listingId={listingId} compact />;
}