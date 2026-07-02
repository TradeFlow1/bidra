export default function ConceptSellPage() {
  return (
    <section className="cm-sell-layout">
      <article className="cm-panel">
        <div className="cm-panel-head">
          <div>
            <h1>Sell your item</h1>
            <p className="cm-subhead">Fast guided flow for daily sellers</p>
          </div>
          <span className="cm-mini-pill">Step 1 of 3</span>
        </div>

        <section className="cm-photo-drop">
          <p className="cm-kicker">Photos first</p>
          <div className="cm-photo-slots">
            <span>Main photo</span>
            <span>Detail</span>
            <span>Condition</span>
            <span>Extra</span>
          </div>
        </section>

        <form className="cm-form" action="#">
          <label>
            Listing title
            <input type="text" placeholder="What are you selling?" />
          </label>
          <label>
            Sale type
            <select defaultValue="both">
              <option value="both">Buy Now and offers</option>
              <option value="buy">Buy Now only</option>
              <option value="offer">Timed offer</option>
            </select>
          </label>
          <label>
            Price (AUD)
            <input type="text" placeholder="e.g. 120" />
          </label>
          <label>
            Description
            <textarea rows={4} placeholder="Condition, inclusions, handover details" />
          </label>
          <div className="cm-action-row">
            <button type="button" className="cm-btn cm-btn-primary">Save draft</button>
            <button type="button" className="cm-btn cm-btn-soft">Preview listing</button>
          </div>
        </form>
      </article>

      <aside className="cm-side-stack">
        <section className="cm-panel cm-action-card">
          <p className="cm-kicker">Seller confidence</p>
          <h2>Publish with trust</h2>
          <p>Use clear photos, realistic pricing, and confirm handover in messages.</p>
          <ul className="cm-bullet-list">
            <li>Photo quality improves search visibility</li>
            <li>Clear handover instructions reduce delays</li>
            <li>Use messages to confirm timing and pickup</li>
          </ul>
        </section>
      </aside>
    </section>
  );
}
