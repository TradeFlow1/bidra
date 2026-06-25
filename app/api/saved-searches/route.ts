import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SavedSearchRow = {
  id: string;
  label: string;
  href: string;
  query: unknown;
  alertEnabled: boolean;
  lastCheckedAt: Date | null;
  lastMatchCount: number;
  createdAt: Date;
  updatedAt: Date;
};

function clean(value: unknown, max = 200) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function queryFromHref(href: string) {
  try {
    const url = new URL(href, "https://bidra.local");
    const out: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      if (key && value) out[key] = value.slice(0, 120);
    });
    return out;
  } catch {
    return {};
  }
}

function serialize(row: SavedSearchRow) {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    query: row.query || {},
    alertEnabled: !!row.alertEnabled,
    lastCheckedAt: row.lastCheckedAt ? row.lastCheckedAt.toISOString() : null,
    lastMatchCount: Number(row.lastMatchCount || 0),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getUserId() {
  const session = await auth();
  return session?.user?.id ? String(session.user.id) : "";
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const rows = await prisma.$queryRaw<SavedSearchRow[]>`
    SELECT "id", "label", "href", "query", "alertEnabled", "lastCheckedAt", "lastMatchCount", "createdAt", "updatedAt"
    FROM "SavedSearch"
    WHERE "userId" = ${userId}
    ORDER BY "updatedAt" DESC
    LIMIT 20
  `;

  return NextResponse.json({ ok: true, savedSearches: rows.map(serialize) });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const href = clean(body.href, 500);
  const label = clean(body.label, 120) || "Saved listing search";
  const alertEnabled = Boolean(body.alertEnabled);

  if (!href.startsWith("/listings")) {
    return NextResponse.json({ ok: false, error: "Only listing searches can be saved." }, { status: 400 });
  }

  const query = queryFromHref(href);
  const id = `ss_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  const rows = await prisma.$queryRaw<SavedSearchRow[]>`
    INSERT INTO "SavedSearch" ("id", "userId", "label", "href", "query", "alertEnabled", "lastCheckedAt", "updatedAt")
    VALUES (${id}, ${userId}, ${label}, ${href}, ${query}, ${alertEnabled}, CASE WHEN ${alertEnabled} THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP)
    ON CONFLICT ("userId", "href") DO UPDATE SET
      "label" = EXCLUDED."label",
      "query" = EXCLUDED."query",
      "alertEnabled" = EXCLUDED."alertEnabled",
      "lastCheckedAt" = CASE WHEN EXCLUDED."alertEnabled" THEN CURRENT_TIMESTAMP ELSE "SavedSearch"."lastCheckedAt" END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "id", "label", "href", "query", "alertEnabled", "lastCheckedAt", "lastMatchCount", "createdAt", "updatedAt"
  `;

  return NextResponse.json({ ok: true, savedSearch: serialize(rows[0]) }, { status: 201 });
}
