import ConceptListingDetail from "@/components/concept-marketplace/ConceptListingDetail";
import ConceptShell from "@/components/concept-marketplace/ConceptShell";

export default function ConceptListingPage() {
  return (
    <ConceptShell title="Concept Listing" active="listings">
      <ConceptListingDetail />
    </ConceptShell>
  );
}
