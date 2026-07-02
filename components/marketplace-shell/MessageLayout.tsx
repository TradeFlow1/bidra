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
    <section>
      <div>
        <div>
          <h2>{title}</h2>
          <Link href="/listings">Browse listings</Link>
        </div>
        <div>
          <button type="button">All</button>
          <button type="button">Unread</button>
          <button type="button">Offers</button>
        </div>
        <div>
          {threads.map((thread, index) => (
            <article key={thread.id} data-active={index === 0 ? "true" : "false"}>
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

      <div>
        <div>
          <h2>Conversation</h2>
          <span>Listing chat</span>
        </div>
        <div>
          <p>City commuter bike</p>
          <p>Buy Now: $420</p>
          <p>Current offer: $390</p>
        </div>
        <p>Is this still available?</p>
        <p>Yes, make an offer or use Buy Now.</p>
        <form action="#">
          <input type="text" placeholder="Write a message" aria-label="Write a message" />
          <button type="button">Send</button>
        </form>
      </div>
    </section>
  );
}
