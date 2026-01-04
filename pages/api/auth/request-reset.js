import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Privacy-safe: do NOT reveal if user exists
    res.status(200).json({ message: "If an account exists, a reset link has been sent." });
    return;
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { email },
    data: { resetToken },
  });

  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  const resetUrl = `${base}/reset-password?token=${resetToken}`;

  await sendResetEmail({ to: email, resetUrl });

  res.status(200).json({ message: "If an account exists, a reset link has been sent." });
}
