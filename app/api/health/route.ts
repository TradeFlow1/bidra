import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type CheckStatus = "ok" | "degraded";

function requiredEnvStatus() {
  const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "NEXT_PUBLIC_SITE_URL"];
  return required.map((name) => ({
    name,
    present: Boolean(String(process.env[name] || "").trim()),
  }));
}

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
  const checks: { name: string; status: CheckStatus; detail?: string }[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({ name: "database", status: "ok" });
  } catch (err) {
    console.error("health database check failed", err);
    checks.push({ name: "database", status: "degraded", detail: "Database connectivity check failed." });
  }

  const env = requiredEnvStatus();
  const missing = env.filter((item) => !item.present).map((item) => item.name);
  if (missing.length) {
    checks.push({ name: "environment", status: "degraded", detail: "Missing required environment variables: " + missing.join(", ") });
  } else {
    checks.push({ name: "environment", status: "ok" });
  }

  const ok = checks.every((check) => check.status === "ok");

  return NextResponse.json(
    {
      ok,
      checkedAt: new Date().toISOString(),
      deployment: deploymentMeta(),
      checks,
      env,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
