export default function Page() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[var(--bidra-bg)] text-[var(--bidra-fg)] px-4 py-10"><div className="mx-auto w-full max-w-3xl"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur">
      <h1 className="text-3xl font-extrabold tracking-tight">Prohibited Items</h1>
      <p className="mt-3 text-sm text-white/80">
        Bidra does not allow listings that are illegal, unsafe, or restricted. This includes items prohibited
        by Australian law and items that pose significant harm risk.
      </p>
      <h2 className="mt-6 text-xl font-extrabold">Examples (not exhaustive)</h2>
      <ul className="mt-3 list-disc pl-6 text-sm text-white/80">
        <li>Weapons, weapon parts, and ammunition</li>
        <li>Explosives, fireworks, or instructions to build dangerous devices</li>
        <li>Illegal drugs and controlled substances</li>
        <li>Stolen goods or counterfeit products</li>
        <li>Personal data dumps, spyware, or hacking tools</li>
      </ul>
      <p className="mt-3 text-sm text-white/80">
        If you see a listing that appears prohibited, report it from the listing page.
      </p>
    </div></div></main>
  );
}
