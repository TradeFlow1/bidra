"use client";

import { FULL_CATEGORIES } from "@/lib/categories";

const CATEGORY_LIST: string[] = (FULL_CATEGORIES as unknown as readonly any[])
  .map((c: any) => (typeof c === "string" ? c : (c.label || c.name || c.title || c.slug || c.id)))
  .filter(Boolean)
  .map((x: any) => String(x));
import { useRouter } from "next/navigation";
import { useState } from "react";
const CONDITION_OPTIONS = [
  "New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
  "For parts / not working",
];

const LOCATION_OPTIONS = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "ACT", "NT"];

type ListingTypeUI = "FIXED_PRICE";

export default function SellNewClient() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Used - Good");
  const [location, setLocation] = useState("QLD");

  const [type, setType] = useState<ListingTypeUI>("FIXED_PRICE");
  const [price, setPrice] = useState("");          // dollars

  const [imageUrls, setImageUrls] = useState("");

  function asDollarsNumberOrNull(s: string): number | null {
    const t = s.trim();
    if (!t) return null;
    const n = Number(t);
    if (!Number.isFinite(n)) return NaN;
    return n;
  }

  function validate(): string | null {
    if (title.trim().length < 3) return "Title must be at least 3 characters.";

    const p = Number(price);
    if (!Number.isFinite(p)) return "Price must be a number.";
    if (p <= 0) return "Price must be greater than $0.";



    return null;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Create a listing</h1>

      {error ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
          <div className="font-semibold">Fix this first:</div>
          <div className="mt-1">{error}</div>
          <div className="mt-2">
            <a href="/account/restrictions" className="underline font-semibold">View restriction details</a>
          </div>
        </div>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          const v = validate();
          if (v) {
            setError(v);
            return;
          }

          setBusy(true);
          try {
            const images = imageUrls
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            const startingPriceCents = Math.round(Number(price) * 100);
const body: any = {
              type, // "AUCTION" | "FIXED_PRICE"
              title: title.trim(),
              description: description.trim(),
              category: category.trim(),
              condition: condition.trim(),
              location: location.trim(),
              price: startingPriceCents,
              images,
            };

            const res = await fetch("/api/listings/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError(String(data?.error || `Create failed (HTTP ${res.status})`));
              return;
            }

            const id = data?.listing?.id;
            if (id) router.push(`/listings/${id}`);
            else router.push("/dashboard");
            router.refresh();
          } catch (err: any) {
            setError(String(err?.message || err));
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <label className="text-sm font-medium">Title *</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="mt-1 w-full rounded-md border p-2"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Sale type</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as ListingTypeUI)}
          >
            <option value="FIXED_PRICE">Fixed price</option></select>
          <div className="mt-1 text-xs opacity-70">
            Listings use fixed pricing. Offers are handled on the listing page.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">
              Price (AUD) *
            </label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="e.g. 120"
              required
            />
          </div>



          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-md border p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Condition</label>
            <select
              className="mt-1 w-full rounded-md border p-2"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <select
              className="mt-1 w-full rounded-md border p-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {LOCATION_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Image URLs (comma separated)</label>
          <input
            className="mt-1 w-full rounded-md border p-2"
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://...jpg, https://...png"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {busy ? "Creating..." : "Create listing"}
        </button>
      </form>
    </main>
  );
}
