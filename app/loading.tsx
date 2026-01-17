export default function Loading() {
  return (
    <main className="bd-container py-8">
      <div className="space-y-4">
        <div className="bd-card p-4">
          <div className="h-5 w-40 rounded bg-black/10 animate-pulse" />
          <div className="mt-3 h-4 w-64 rounded bg-black/10 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bd-card overflow-hidden">
              <div className="aspect-[4/3] bg-black/10 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-black/10 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-black/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
