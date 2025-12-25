import SellNewClient from "./sell-new-client";

export const dynamic = "force-dynamic";

export default function SellNewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Create a listing</h1>
      <p className="mt-2 text-sm opacity-80">
        Add the basics — title, description, category, condition, location, and price.
      </p>

      <div className="mt-6">
        <SellNewClient />
      </div>
    </main>
  );
}

