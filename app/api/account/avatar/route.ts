import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxAvatarBytes = 5 * 1024 * 1024;

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image first." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WEBP, or GIF image." }, { status: 400 });
  }

  if (file.size > maxAvatarBytes) {
    return NextResponse.json({ error: "Profile picture must be smaller than 5 MB." }, { status: 400 });
  }

  try {
    const extension = extensionForType(file.type);
    const filename = `avatars/${session.user.id}-${Date.now()}.${extension}`;
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: blob.url },
    });

    return NextResponse.json({ ok: true, avatarUrl: blob.url });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json({ error: "Could not upload profile picture." }, { status: 500 });
  }
}
