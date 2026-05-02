import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function deploymentMeta() {
  return {
    environment: process.env.NODE_ENV || "unknown",
    vercelEnvironment: process.env.VERCEL_ENV || null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12) : null,
    region: process.env.VERCEL_REGION || null,
    service: "bidra",
  };
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "ping-app",
      checkedAt: new Date().toISOString(),
      deployment: deploymentMeta(),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
