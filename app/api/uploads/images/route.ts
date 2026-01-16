import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Blob token missing" }, { status: 500 });

  try {
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

      const safeName = (f.name || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `listings/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;

      const blob = await put(key, f, { token, contentType: f.type });
      urls.push(blob.url);
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
