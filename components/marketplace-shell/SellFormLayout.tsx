type SellFormLayoutProps = {
  title?: string;
};

export default function SellFormLayout({ title = "Create a listing" }: SellFormLayoutProps) {
  return (
    <section className="mk-panel mk-sell-layout">
      <div className="mk-panel-head">
        <h2>{title}</h2>
      </div>
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
        <div className="mk-action-row">
          <button type="button" className="mk-btn mk-btn-primary">Save draft</button>
          <button type="button" className="mk-btn mk-btn-ghost">Preview listing</button>
        </div>
      </form>
    </section>
  );
}
