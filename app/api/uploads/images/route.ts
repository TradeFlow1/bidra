import crypto from "crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdult } from "@/lib/require-adult";
import { prisma } from "@/lib/prisma";
import { textLooksProhibited } from "@/lib/prohibited-items";
import { applyPolicyStrike, isPolicyBlocked } from "@/lib/policy-strike";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Blob token missing" }, { status: 500 });

  // Auth + 18+ gate (also gives us session)
  const gate = await requireAdult();
  if (!gate.ok) {
    return NextResponse.json({ ok: false, reason: gate.reason }, {
      status: gate.status,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const session = gate.session;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // If currently blocked (policy ladder)
    const pb = await isPolicyBlocked(session.user.id);
    if (pb.blocked) {
      return NextResponse.json(
        { error: "Account temporarily restricted due to policy violations. Try again later." },
        { status: 403 }
      );
    }

    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Too many files (max 10)." }, { status: 400 });
    }

    const urls: string[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;

      if (!f.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
      }
      if (f.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Each image must be <= 8MB." }, { status: 400 });
      }

      // ---- POLICY ENFORCEMENT (upload filename keywords) ----
      const rawName = String((f as any).name ?? "");
      if (rawName && textLooksProhibited(rawName)) {
        const strike = await applyPolicyStrike(session.user.id);

        // audit (best-effort)
        try {
          await prisma.adminEvent.create({
            data: {
              type: "UPLOAD_POLICY_BLOCKED_IMAGE",
              userId: session.user.id,
              data: {
                strikes: strike.strikes,
                blockedUntil: strike.blockedUntil ? new Date(strike.blockedUntil).toISOString() : null,
                filename: rawName,
                at: new Date().toISOString(),
              },
            },
          });
        } catch (e) {
          console.warn("[ADMIN_AUDIT] Failed to log UPLOAD_POLICY_BLOCKED_IMAGE", e);
        }

        return NextResponse.json(
          {
            error: "This image is not permitted to be uploaded.",
            policy: { strikes: strike.strikes, blockedUntil: strike.blockedUntil },
          },
          { status: 400 }
        );
      }

      const safeName = (rawName || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
      const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(16).toString("hex");
      const key = `listings/${Date.now()}-${id}-${safeName}`;

      const blob = await put(key, f, { token, contentType: f.type, access: "public" });
      urls.push(blob.url);
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
