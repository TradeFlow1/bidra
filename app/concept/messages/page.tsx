import ConceptMessages from "@/components/concept-marketplace/ConceptMessages";
import ConceptShell from "@/components/concept-marketplace/ConceptShell";

export default function ConceptMessagesRoute() {
  return (
    <ConceptShell title="Concept Messages" active="messages">
      <section className="cm-panel cm-command cm-command-tight">
        <p className="cm-kicker">Inbox</p>
        <h1>Marketplace chat with listing context</h1>
        <p className="cm-subhead">All messages tied directly to listings and handover details.</p>
      </section>
      <ConceptMessages />
    </ConceptShell>
  );
}
