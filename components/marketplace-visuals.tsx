import BrandLogo from "./brand-logo";

export function MarketplaceIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const props = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "search") return <svg {...props}><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="7" /></svg>;
  if (name === "shield") return <svg {...props}><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /></svg>;
  if (name === "pin") return <svg {...props}><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
  if (name === "tag") return <svg {...props}><path d="M20 13 13 20 4 11V4h7l9 9Z" /><path d="M7.5 7.5h.01" /></svg>;
  if (name === "phone") return <svg {...props}><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M11 18h2" /></svg>;
  if (name === "home") return <svg {...props}><path d="M4 11 12 5l8 6" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>;
  if (name === "car") return <svg {...props}><path d="m5 12 2-5h10l2 5" /><rect x="4" y="12" width="16" height="6" rx="2" /><path d="M7 18v2M17 18v2" /></svg>;
  if (name === "ball") return <svg {...props}><circle cx="12" cy="12" r="8" /><path d="M5.5 10h13M8 5.5c2.2 3.8 2.2 9.2 0 13M16 5.5c-2.2 3.8-2.2 9.2 0 13" /></svg>;
  if (name === "shirt") return <svg {...props}><path d="M8 4 5 6.5 3 10l4 2v8h10v-8l4-2-2-3.5L16 4a5 5 0 0 1-8 0Z" /></svg>;
  if (name === "baby") return <svg {...props}><circle cx="12" cy="8" r="3" /><path d="M6 21a6 6 0 0 1 12 0M9 14l-3 3M15 14l3 3" /></svg>;
  if (name === "chat") return <svg {...props}><path d="M5 6.5h14v9H8l-3 3v-12Z" /></svg>;
  if (name === "user") return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
  if (name === "heart") return <svg {...props}><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" /></svg>;
  if (name === "plus") return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === "lock") return <svg {...props}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  if (name === "help") return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.8 2.8 0 0 1 5 1.8c0 2-2.5 2.3-2.5 4" /><path d="M12 18h.01" /></svg>;
  return <svg {...props}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>;
}

export function AvatarPlaceholder({ label = "B", size = "h-16 w-16" }: { label?: string; size?: string }) {
  const initial = String(label || "B").trim().charAt(0).toUpperCase() || "B";
  return <div className={`${size} grid shrink-0 place-items-center rounded-full border border-[#D7E2F1] bg-[linear-gradient(135deg,#EEF4FF,#FFFFFF)] text-xl font-black text-[#0B4DFF] shadow-sm`}>{initial}</div>;
}

export function EmptyIllustration({ icon = "chat" }: { icon?: string }) {
  return <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] border border-[#D7E2F1] bg-white text-[#0B4DFF] shadow-sm"><MarketplaceIcon name={icon} className="h-8 w-8" /></div>;
}

export function AppBadge({ store }: { store: "apple" | "google" }) {
  return <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/35 px-4 text-xs font-black text-white"><span className="grid h-6 w-6 place-items-center rounded-md bg-white text-[#06132B]">{store === "apple" ? "" : "G"}</span><span>{store === "apple" ? "App Store" : "Google Play"}</span></span>;
}

export function MiniLogoCard() {
  return <div className="rounded-2xl bg-white p-2 shadow-sm"><BrandLogo variant="symbol" className="h-8 w-8" /></div>;
}
