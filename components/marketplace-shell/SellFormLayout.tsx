type SellFormLayoutProps = {
  title?: string;
};

export default function SellFormLayout({ title = "Create a listing" }: SellFormLayoutProps) {
  return (
    <section className="mk-panel mk-sell-layout">
      <div className="mk-panel-head">
        <h2>{title}</h2>
        <span className="mk-thread-pill">Step 1 of 3</span>
      </div>
      <p className="mk-sell-intro">Create a clean listing quickly. Save, review, then publish.</p>

      <div className="mk-sell-progress" aria-label="Listing progress">
        <span className="mk-sell-progress-bar" />
      </div>

      <section className="mk-photo-zone" aria-label="Photo section">
        <p className="mk-photo-title">Photos</p>
        <p>Add clear photos. First photo appears in search cards.</p>
        <div className="mk-photo-grid" aria-hidden="true">
          <span>Front</span>
          <span>Detail</span>
          <span>Condition</span>
          <span>Extra</span>
        </div>
      </section>

      <form className="mk-form" action="#">
        <label>
          Sale type
          <select defaultValue="fixed">
            <option value="fixed">Buy Now</option>
            <option value="offer">Timed offer</option>
            <option value="combo">Buy Now and offers</option>
          </select>
        </label>
        <label>
          Title
          <input type="text" placeholder="What are you selling?" />
        </label>
        <label>
          Description
          <textarea rows={4} placeholder="Describe condition, inclusions and handover options" />
        </label>
        <label>
          Category
          <select defaultValue="home">
            <option value="home">Home and Furniture</option>
            <option value="tools">Tools and DIY</option>
            <option value="fashion">Fashion and Wearables</option>
          </select>
        </label>
        <label>
          Location
          <input type="text" placeholder="Suburb, state" />
        </label>
        <label>
          Price (AUD)
          <input type="text" placeholder="e.g. 120" />
        </label>
        <label>
          Handover notes
          <textarea rows={3} placeholder="Pickup window, preferred area, and payment notes" />
        </label>

        <div className="mk-sell-checklist">
          <p>Before publish</p>
          <ul>
            <li>Use a clear title with item condition</li>
            <li>Add at least 3 photos before publish</li>
            <li>Confirm location and handover availability</li>
          </ul>
        </div>

        <div className="mk-action-row">
          <button type="button" className="mk-btn mk-btn-primary">Save draft</button>
          <button type="button" className="mk-btn mk-btn-ghost">Preview listing</button>
        </div>
      </form>
    </section>
  );
}
