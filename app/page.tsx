import Image from "next/image";
import Link from "next/link";
import HomeCategorySelect from "../components/home-category-select";

const heroPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.98)",
  color: "rgba(15,23,42,0.92)",
  border: "1px solid rgba(15,23,42,0.10)",
  boxShadow: "0 1px 2px rgba(2,6,23,0.06)",
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
  lineHeight: 1,
};

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <section className="hero">
          <div className="heroCard">
            {/* Big hero logo ONCE */}
            <div style={{ marginBottom: 18, width: 260, maxWidth: "70vw" }}>
              <Image
                src="/brand/logo/bidra-logo_light.png"
                alt="Bidra"
                width={1200}
                height={400}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <h1 className="h1">A marketplace built on trust, not noise.</h1>
            <p className="p">
              Where real bids replace empty messages — so buying and selling actually happens.
            </p>

            <div className="btnRow">
              <Link href="/account" style={heroPill}>Get early access</Link>
              <Link href="/listings" style={heroPill}>Browse listings</Link>
              <span style={heroPill}>Private beta • Australia-first</span>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 26 }}>
          <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>
            Why Bidra feels different
          </h2>
          <p className="p" style={{ marginTop: 10 }}>
            </p>

          <div className="grid3" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="cardTitle">Real bids, real intent</div>
              <p className="cardBody">
                Bids replace vague messages so sellers know who’s serious.
              </p>
            </div>
            <div className="card">
              <div className="cardTitle">Accountability built in</div>
              <p className="cardBody">
                Buyers and sellers earn trust by following through.
              </p>
            </div>
            <div className="card">
              <div className="cardTitle">Less noise, better deals</div>
              <p className="cardBody">
                Fewer time-wasters. More completed trades.
              </p>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>Explore categories</h2>
            <Link href="/categories" style={{ color: "var(--muted)", fontSize: 14 }}>
            </Link>
          </div>
          <p className="p" style={{ marginTop: 10 }}>A calm place to start.</p>

          {/* Placeholder shell only — your existing categories can render here */}
          <div className="card" style={{ marginTop: 14 }}>
            <p className="cardBody" style={{ margin: 0 }}>
              <HomeCategorySelect />
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 10, paddingBottom: 70 }}>
          <h2 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.01em" }}>How bidding works</h2>
          <p className="p" style={{ marginTop: 10 }}></p>

          <div className="grid3" style={{ marginTop: 16 }}>
            <div className="card">
              <div className="cardTitle">1) Find something you want</div>
              <p className="cardBody">Browse calmly. Decide fast.</p>
            </div>
            <div className="card">
              <div className="cardTitle">2) Place a bid (intent matters)</div>
              <p className="cardBody">Bids replace empty messages.</p>
            </div>
            <div className="card">
              <div className="cardTitle">3) Win, pay, collect</div>
              <p className="cardBody">Without the runaround.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
