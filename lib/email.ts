import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function mustEnv(name: string): string {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : "";
}

function isConfiguredSES(): boolean {
  // Only send real emails when explicitly enabled.
  // Prevents broken AWS keys from crashing auth flows.
  if (String(process.env.SES_ENABLED ?? "").trim() !== "1") return false;

  return Boolean(
    mustEnv("AWS_REGION") &&
    mustEnv("AWS_ACCESS_KEY_ID") &&
    mustEnv("AWS_SECRET_ACCESS_KEY") &&
    mustEnv("SES_FROM_EMAIL")
  );
}

function sesClient(): SESClient {
  return new SESClient({
    region: mustEnv("AWS_REGION"),
    credentials: {
      accessKeyId: mustEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: mustEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });
}

async function sendEmail(args: { to: string; subject: string; text: string }) {
  const to = String(args.to || "").trim().toLowerCase();
  if (!to) return;

  const from = mustEnv("SES_FROM_EMAIL") || "Bidra <no-reply@bidra.com.au>";

  // Dev-safe fallback: if SES not configured, log only.
  if (!isConfiguredSES()) {
    if (process.env.NODE_ENV !== "production") {

    }
    return;
  }

  if (process.env.NODE_ENV !== "production") {

  }

  const cmd = new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: args.subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: args.text, Charset: "UTF-8" },
      },
    },
  });

  try {
    const out = await sesClient().send(cmd);
    if (process.env.NODE_ENV !== "production") {

    }
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e && "message" in e
        ? String((e as any).message)
        : String(e);
    console.error("[Bidra][SES ERROR]", { to, err: msg });
    throw e;
  }
}

export async function sendPasswordResetEmail(args: { to: string; resetUrl: string }) {
  const to = String(args.to || "").trim();
  const resetUrl = String(args.resetUrl || "").trim();
  if (!to || !resetUrl) return;

  await sendEmail({
    to,
    subject: "Reset your Bidra password",
    text:
      "Reset your Bidra password:\n\n" +
      resetUrl +
      "\n\nThis link expires in 30 minutes. If you didn’t request this, you can ignore this email.",
  });
}

export async function sendVerifyEmail(args: { to: string; verifyUrl: string }) {
  const to = String(args.to || "").trim();
  const verifyUrl = String(args.verifyUrl || "").trim();
  if (!to || !verifyUrl) return;

  await sendEmail({
    to,
    subject: "Verify your Bidra email",
    text:
      "Verify your Bidra email:\n\n" +
      verifyUrl +
      "\n\nIf you didn’t create an account, you can ignore this email.",
  });
}
