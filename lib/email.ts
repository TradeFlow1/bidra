import { Resend } from "resend";

function mustEnv(name: string): string {
  const v = process.env[name];
  return (v && String(v).trim()) ? String(v).trim() : "";
}

export async function sendPasswordResetEmail(args: {
  to: string;
  resetUrl: string;
}) {
  const to = String(args.to || "").trim();
  const resetUrl = String(args.resetUrl || "").trim();
  if (!to || !resetUrl) return;

  const resendKey = mustEnv("RESEND_API_KEY");
  const from = mustEnv("RESEND_FROM") || "Bidra <no-reply@bidra.com.au>";

  // Dev fallback: if no provider configured, log link only (still "real" for dev),
  // but production MUST have RESEND_API_KEY set.
  if (!resendKey) {
    console.log("[Bidra] Password reset link (DEV):", resetUrl);
    return;
  }

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from,
    to,
    subject: "Reset your Bidra password",
    text:
      "Reset your Bidra password:\n\n" +
      resetUrl +
      "\n\nThis link expires in 30 minutes. If you didn’t request this, you can ignore this email.",
  });
}
