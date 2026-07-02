const threads = [
  { id: "m1", person: "Mia", listing: "City commuter bike", preview: "Can pick up after 6pm", time: "2m" },
  { id: "m2", person: "Noah", listing: "Monitor 27 inch", preview: "I sent a higher offer", time: "18m" },
  { id: "m3", person: "Olivia", listing: "Storage shelf", preview: "Still available tomorrow?", time: "1h" },
];

export default function ConceptMessages() {
  return (
    <section className="cm-messages-layout">
      <article className="cm-panel">
        <div className="cm-panel-head">
          <h2>Messages</h2>
          <span className="cm-mini-pill">12 active</span>
        </div>
        <div className="cm-thread-list">
          {threads.map((thread, index) => (
            <article key={thread.id} className={index === 0 ? "cm-thread cm-thread-active" : "cm-thread"}>
              <div>
                <h3>{thread.person}</h3>
                <p className="cm-thread-listing">{thread.listing}</p>
                <p>{thread.preview}</p>
              </div>
              <span>{thread.time}</span>
            </article>
          ))}
        </div>
      </article>

      <article className="cm-panel cm-thread-pane">
        <div className="cm-panel-head">
          <h2>Conversation</h2>
          <span className="cm-mini-pill">Listing context</span>
        </div>
        <div className="cm-context-card">
          <p className="cm-context-title">City commuter bike</p>
          <p>Buy Now $420</p>
          <p>Current offer $390</p>
        </div>
        <div className="cm-bubble cm-bubble-them">Is this still available tonight?</div>
        <div className="cm-bubble cm-bubble-me">Yes. You can make an offer now or use Buy Now.</div>
        <form className="cm-compose" action="#">
          <input type="text" placeholder="Write a message" aria-label="Write a message" />
          <button type="button" className="cm-btn cm-btn-primary">Send</button>
        </form>
      </article>
    </section>
  );
}
