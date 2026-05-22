import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function clean(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length ? text : null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const form = await request.formData();
  const name = clean(form.get("name"));
  const bio = clean(form.get("bio"));
  const phone = clean(form.get("phone"));
  const postcode = clean(form.get("postcode"));
  const suburb = clean(form.get("suburb"));
  const state = clean(form.get("state"));
  const location = [suburb, state].filter(Boolean).join(", ");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio,
      phone,
      postcode,
      suburb,
      state,
      location: location || null,
    },
  });

  return NextResponse.redirect(new URL("/account?updated=1#edit-account", request.url));
}
