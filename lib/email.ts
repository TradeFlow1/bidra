import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function mustEnv(name: string): string {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : "";
}

function siteUrl(): string {
  // Prefer NEXTAUTH_URL in prod; fallback to public domain; then localhost for dev
  const v =
    mustEnv("NEXTAUTH_URL") ||
    mustEnv("SITE_URL") ||
    "https://www.bidra.com.au";
  return String(v).replace(/\/+$/, "");
}

function isConfiguredSES(): boolean {
  // Only send real emails when explicitly enabled.
  // Prevents broken AWS keys from crashing flows.
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
      console.log("[Bidra][EMAIL:DEV-LOG ONLY]", { to, subject: args.subject });
    }
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[Bidra][EMAIL:SENDING]", { to, subject: args.subject });
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
      console.log("[Bidra][EMAIL:SENT]", { to, messageId: (out as any)?.MessageId });
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

export async function sendNewMessageEmail(args: {
  to: string;
  threadId: string;
  listingTitle?: string | null;
}) {
  const to = String(args.to || "").trim();
  const threadId = String(args.threadId || "").trim();
  if (!to || !threadId) return;

  const url = siteUrl() + "/messages/" + encodeURIComponent(threadId);
  const title = String(args.listingTitle || "").trim();

  await sendEmail({
    to,
    subject: title ? `New message about: ${title}` : "You have a new message on Bidra",
    text:
      "You have a new message on Bidra.\n\n" +
      (title ? `Listing: ${title}\n\n` : "") +
      "View and reply here:\n" +
      url +
      "\n\nIf you weren’t expecting this, you can ignore this email.",
  });
}

export async function sendBuyNowPlacedEmail(args: {
  to: string;
  orderId: string;
  listingTitle?: string | null;
  amountCents: number;
  role: "BUYER" | "SELLER";
}) {
  const to = String(args.to || "").trim();
  const orderId = String(args.orderId || "").trim();
  if (!to || !orderId) return;

  const url = siteUrl() + "/orders/" + encodeURIComponent(orderId);
  const title = String(args.listingTitle || "").trim();
  const amount = Number.isFinite(args.amountCents) ? args.amountCents : 0;
  const dollars = "$" + (amount / 100).toFixed(2);

  const who =
    args.role === "BUYER"
      ? "Your Buy Now order has been placed."
      : "A buyer has placed a Buy Now order on your listing.";

  await sendEmail({
    to,
    subject: title ? `Buy Now placed: ${title}` : "Buy Now order placed",
    text:
      who +
      "\n\n" +
      (title ? `Listing: ${title}\n` : "") +
      `Amount: ${dollars}\n\n` +
      "View order details:\n" +
      url +
      "\n\n(You may need to sign in.)",
  });
}

export async function sendNewTopOfferEmail(args: {
  to: string;
  listingId: string;
  listingTitle?: string | null;
  amountCents: number;
}) {
  const to = String(args.to || "").trim();
  const listingId = String(args.listingId || "").trim();
  if (!to || !listingId) return;

  const url = siteUrl() + "/listings/" + encodeURIComponent(listingId);
  const title = String(args.listingTitle || "").trim();
  const amount = Number.isFinite(args.amountCents) ? args.amountCents : 0;
  const dollars = "$" + (amount / 100).toFixed(2);

  await sendEmail({
    to,
    subject: title ? `New top offer: ${title}` : "You have a new top offer",
    text:
      "Your listing has a new top offer.\n\n" +
      (title ? `Listing: ${title}\n` : "") +
      `Current top offer: ${dollars}\n\n` +
      "View listing:\n" +
      url +
      "\n\n(You may need to sign in.)",
  });
}
