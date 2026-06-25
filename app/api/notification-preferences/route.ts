import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PreferenceRow = {
  id: string;
  userId: string;
  messages: boolean;
  offers: boolean;
  watchlist: boolean;
  savedSearches: boolean;
  feedback: boolean;
  productUpdates: boolean;
  marketing: boolean;
  emailDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const defaults = {
  messages: true,
  offers: true,
  watchlist: true,
  savedSearches: true,
  feedback: true,
  productUpdates: false,
  marketing: false,
  emailDigest: false,
};

function preferenceId() {
  return `np_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function serialize(row: PreferenceRow) {
  return {
    messages: !!row.messages,
    offers: !!row.offers,
    watchlist: !!row.watchlist,
    savedSearches: !!row.savedSearches,
    feedback: !!row.feedback,
    productUpdates: !!row.productUpdates,
    marketing: !!row.marketing,
    emailDigest: !!row.emailDigest,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function getUserId() {
  const session = await auth();
  return session?.user?.id ? String(session.user.id) : "";
}

async function ensurePreferences(userId: string) {
  const rows = await prisma.$queryRaw<PreferenceRow[]>`
    INSERT INTO "NotificationPreference" ("id", "userId")
    VALUES (${preferenceId()}, ${userId})
    ON CONFLICT ("userId") DO UPDATE SET "updatedAt" = "NotificationPreference"."updatedAt"
    RETURNING "id", "userId", "messages", "offers", "watchlist", "savedSearches", "feedback", "productUpdates", "marketing", "emailDigest", "createdAt", "updatedAt"
  `;
  return rows[0];
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  const row = await ensurePreferences(userId);
  return NextResponse.json({ ok: true, preferences: serialize(row) });
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401 });

  await ensurePreferences(userId);
  const body = await req.json().catch(() => ({}));

  const next = {
    messages: typeof body.messages === "boolean" ? body.messages : defaults.messages,
    offers: typeof body.offers === "boolean" ? body.offers : defaults.offers,
    watchlist: typeof body.watchlist === "boolean" ? body.watchlist : defaults.watchlist,
    savedSearches: typeof body.savedSearches === "boolean" ? body.savedSearches : defaults.savedSearches,
    feedback: typeof body.feedback === "boolean" ? body.feedback : defaults.feedback,
    productUpdates: typeof body.productUpdates === "boolean" ? body.productUpdates : defaults.productUpdates,
    marketing: typeof body.marketing === "boolean" ? body.marketing : defaults.marketing,
    emailDigest: typeof body.emailDigest === "boolean" ? body.emailDigest : defaults.emailDigest,
  };

  const rows = await prisma.$queryRaw<PreferenceRow[]>`
    UPDATE "NotificationPreference"
    SET "messages" = ${next.messages},
        "offers" = ${next.offers},
        "watchlist" = ${next.watchlist},
        "savedSearches" = ${next.savedSearches},
        "feedback" = ${next.feedback},
        "productUpdates" = ${next.productUpdates},
        "marketing" = ${next.marketing},
        "emailDigest" = ${next.emailDigest},
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = ${userId}
    RETURNING "id", "userId", "messages", "offers", "watchlist", "savedSearches", "feedback", "productUpdates", "marketing", "emailDigest", "createdAt", "updatedAt"
  `;

  return NextResponse.json({ ok: true, preferences: serialize(rows[0]) });
}
