type SellFormLayoutProps = {
  title?: string;
};

export default function SellFormLayout({ title = "Create a listing" }: SellFormLayoutProps) {
  return (
    <section>
      <div>
        <h2>{title}</h2>
        <span>Step 1 of 3</span>
      </div>
      <p>Create a clean listing quickly. Save, review, then publish.</p>

      <div aria-label="Listing progress">
        <span>Progress</span>
      </div>

      <section aria-label="Photo section">
        <p>Photos</p>
        <p>Add clear photos. First photo appears in search cards.</p>
        <div aria-hidden="true">
          <span>Front</span>
          <span>Detail</span>
          <span>Condition</span>
          <span>Extra</span>
        </div>
      </section>

      <form action="#">
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

        <div>
          <p>Before publish</p>
          <ul>
            <li>Use a clear title with item condition</li>
            <li>Add at least 3 photos before publish</li>
            <li>Confirm location and handover availability</li>
          </ul>
        </div>

        <div>
          <button type="button">Save draft</button>
          <button type="button">Preview listing</button>
        </div>
      </form>
    </section>
  );
}
