import ConceptSellPage from "@/components/concept-marketplace/ConceptSellPage";
import ConceptShell from "@/components/concept-marketplace/ConceptShell";

export default function ConceptSellRoute() {
  return (
    <ConceptShell title="Concept Sell" active="sell">
      <ConceptSellPage />
    </ConceptShell>
  );
}
