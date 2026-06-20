import type { ReactNode } from "react";
import ListingsSavedSearchToolbar from "./saved-search-toolbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ListingsSavedSearchToolbar />
    </>
  );
}
