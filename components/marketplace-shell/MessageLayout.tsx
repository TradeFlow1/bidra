import Link from "next/link";

type MessageLayoutProps = {
  title?: string;
};

const threads = [
  { id: "t1", person: "Mia", listing: "Family bike", preview: "Can pick up tonight", time: "2m" },
  { id: "t2", person: "Noah", listing: "Hand tools", preview: "Offer sent", time: "18m" },
  { id: "t3", person: "Olivia", listing: "Outdoor chairs", preview: "Available this weekend", time: "1h" },
];

export default function MessageLayout({ title = "Messages" }: MessageLayoutProps) {
  return (
    <section className="mk-message-layout">
      <div className="mk-panel">
        <div className="mk-panel-head">
          <h2>{title}</h2>
          <Link href="/listings">Browse</Link>
        </div>
        <div className="mk-thread-list">
          {threads.map((thread) => (
            <article key={thread.id} className="mk-thread-item">
              <div>
                <h3>{thread.person}</h3>
                <p>{thread.listing}</p>
                <p>{thread.preview}</p>
              </div>
              <span>{thread.time}</span>
            </article>
          ))}
        </div>
      </div>

      <div className="mk-panel mk-conversation">
        <h2>Conversation</h2>
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
