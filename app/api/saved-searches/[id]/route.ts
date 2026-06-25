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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const id = String(params.id || "").trim();
  const body = await req.json().catch(() => ({}));
  const alertEnabled = Boolean(body.alertEnabled);

  const rows = await prisma.$queryRaw<SavedSearchRow[]>`
    UPDATE "SavedSearch"
    SET "alertEnabled" = ${alertEnabled},
        "lastCheckedAt" = CASE WHEN ${alertEnabled} THEN CURRENT_TIMESTAMP ELSE "lastCheckedAt" END,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${id} AND "userId" = ${userId}
    RETURNING "id", "label", "href", "query", "alertEnabled", "lastCheckedAt", "lastMatchCount", "createdAt", "updatedAt"
  `;

  if (!rows.length) return NextResponse.json({ ok: false, error: "Saved search not found." }, { status: 404 });
  return NextResponse.json({ ok: true, savedSearch: serialize(rows[0]) });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const id = String(params.id || "").trim();
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    DELETE FROM "SavedSearch"
    WHERE "id" = ${id} AND "userId" = ${userId}
    RETURNING "id"
  `;

  if (!rows.length) return NextResponse.json({ ok: false, error: "Saved search not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
