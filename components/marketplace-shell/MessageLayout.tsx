import Link from "next/link";

type MessageLayoutProps = {
  title?: string;
};

const threads = [
  { id: "t1", person: "Mia", listing: "Family bike", preview: "Can pick up tonight", time: "2m" },
  { id: "t2", person: "Noah", listing: "Hand tools", preview: "I sent an offer", time: "18m" },
  { id: "t3", person: "Olivia", listing: "Outdoor chairs", preview: "Available this weekend", time: "1h" },
  { id: "t4", person: "Ethan", listing: "Phone tripod", preview: "Is Buy Now still active?", time: "3h" },
];

export default function MessageLayout({ title = "Messages" }: MessageLayoutProps) {
  return (
    <section className="mk-message-layout">
      <div className="mk-panel mk-inbox-panel">
        <div className="mk-panel-head">
          <h2>{title}</h2>
          <Link href="/listings">Browse listings</Link>
        </div>
        <div className="mk-thread-filter">
          <button type="button" className="mk-thread-filter-item mk-thread-filter-item-active">All</button>
          <button type="button" className="mk-thread-filter-item">Unread</button>
          <button type="button" className="mk-thread-filter-item">Offers</button>
        </div>
        <div className="mk-thread-list">
          {threads.map((thread, index) => (
            <article key={thread.id} className={index === 0 ? "mk-thread-item mk-thread-item-active" : "mk-thread-item"}>
              <div>
                <h3>{thread.person}</h3>
                <p className="mk-thread-listing">{thread.listing}</p>
                <p>{thread.preview}</p>
              </div>
              <span>{thread.time}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="mk-panel mk-conversation">
        <div className="mk-conversation-head">
          <h2>Conversation</h2>
          <span className="mk-thread-pill">Listing chat</span>
        </div>
        <div className="mk-chat-context">
          <p className="mk-chat-context-title">City commuter bike</p>
          <p>Buy Now: $420</p>
          <p>Current offer: $390</p>
        </div>
        <div className="mk-bubble mk-bubble-theirs">Is this still available?</div>
        <div className="mk-bubble mk-bubble-mine">Yes, make an offer or use Buy Now.</div>
        <form className="mk-compose" action="#">
          <input type="text" placeholder="Write a message" aria-label="Write a message" />
          <button type="button" className="mk-btn mk-btn-primary">Send</button>
        </form>
      </div>
    </section>
  );
}
