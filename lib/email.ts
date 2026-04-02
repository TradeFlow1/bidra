import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function mustEnv(name: string): string {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : "";
}

function siteUrl(): string {
  const v =
    mustEnv("NEXTAUTH_URL") ||
    mustEnv("SITE_URL") ||
    "https://www.bidra.com.au";
  return String(v).replace(/\/+$/, "");
}

function isConfiguredSES(): boolean {
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

function renderEmailTemplate(args: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  return `
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px;">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#111;text-align:center;padding:14px 16px;">
  <img src="https://www.bidra.com.au/brand/bidra-kangaroo-logo.png"
       alt="Bidra"
       style="display:block;margin:0 auto;height:80px;" />
</td>
            </tr>
            <tr>
              <td style="padding:24px;color:#333;">
                <h2 style="margin-top:0;">
${args.title}
</h2>
                <p style="line-height:1.5;">
${args.body}
</p>
                
${args.ctaUrl ? `
                  <div style="margin-top:24px;">
                    <a href="
${args.ctaUrl}
" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
                      
${args.ctaLabel || "Open"}

                    </a>
                  </div>
                ` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:16px;font-size:12px;color:#888;text-align:center;">
                © Bidra
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}
export async function sendEmail(args: { to: string; subject: string; text: string; html?: string }) {
  const to = String(args.to || "").trim().toLowerCase();
  if (!to) return;

  if (!isConfiguredSES()) return;

  const cmd = new SendEmailCommand({
    Source: mustEnv("SES_FROM_EMAIL"),
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: args.subject, Charset: "UTF-8" },
      Body: {
        Text: { Data: args.text, Charset: "UTF-8" },
        Html: args.html ? { Data: args.html, Charset: "UTF-8" } : undefined,
      },
    },
  });

  await sesClient().send(cmd);
}

export async function sendPasswordResetEmail(args: { to: string; resetUrl: string }) {
  const html = renderEmailTemplate({
    title: "Reset your password",
    body: "Click the button below to reset your password. This link expires in 30 minutes.",
    ctaLabel: "Reset password",
    ctaUrl: args.resetUrl,
  });

  await sendEmail({
    to: args.to,
    subject: "Reset your Bidra password",
    text:
      "Reset your password:\n\n" +
      args.resetUrl +
      "\n\nThis link expires in 30 minutes.",
    html,
  });
}

export async function sendVerifyEmail(args: { to: string; verifyUrl: string }) {
  const html = renderEmailTemplate({
    title: "Verify your email",
    body: "Click the button below to verify your Bidra email address.",
    ctaLabel: "Verify email",
    ctaUrl: args.verifyUrl,
  });

  await sendEmail({
    to: args.to,
    subject: "Verify your Bidra email",
    text: "Verify your Bidra email:\n\n" + args.verifyUrl,
    html,
  });
}

export async function sendNewMessageEmail(args: {
  to: string;
  threadId: string;
  listingTitle?: string | null;
}) {
  const url = siteUrl() + "/messages/" + encodeURIComponent(args.threadId);

  const body = args.listingTitle
    ? "You have a new message about " + args.listingTitle + ". Click below to view it."
    : "You have a new message on Bidra. Click below to view it.";

  const html = renderEmailTemplate({
    title: "New message",
    body,
    ctaLabel: "View message",
    ctaUrl: url,
  });

  await sendEmail({
    to: args.to,
    subject: "New message on Bidra",
    text:
      "You have a new message.\n\n" +
      (args.listingTitle ? "Listing: " + args.listingTitle + "\n\n" : "") +
      url,
    html,
  });
}

export async function sendBuyNowPlacedEmail(args: {
  to: string;
  orderId: string;
  listingTitle?: string | null;
  amountCents: number;
  role: "BUYER" | "SELLER";
}) {
  const url = siteUrl() + "/orders/" + encodeURIComponent(args.orderId);
  const dollars = "$" + (args.amountCents / 100).toFixed(2);

  const body = args.listingTitle
    ? "Buy Now placed for " + args.listingTitle + " at " + dollars + "."
    : "Buy Now placed at " + dollars + ".";

  const html = renderEmailTemplate({
    title: "Buy Now placed",
    body,
    ctaLabel: "View order",
    ctaUrl: url,
  });

  await sendEmail({
    to: args.to,
    subject: "Buy Now placed",
    text:
      (args.listingTitle ? "Listing: " + args.listingTitle + "\n" : "") +
      "Amount: " + dollars + "\n\n" +
      url,
    html,
  });
}

export async function sendNewTopOfferEmail(args: {
  to: string;
  listingId: string;
  listingTitle?: string | null;
  amountCents: number;
}) {
  const url = siteUrl() + "/listings/" + encodeURIComponent(args.listingId);
  const dollars = "$" + (args.amountCents / 100).toFixed(2);

  const body = args.listingTitle
    ? "New top offer of " + dollars + " on " + args.listingTitle + "."
    : "New top offer of " + dollars + ".";

  const html = renderEmailTemplate({
    title: "New top offer",
    body,
    ctaLabel: "View listing",
    ctaUrl: url,
  });

  await sendEmail({
    to: args.to,
    subject: "New top offer",
    text:
      (args.listingTitle ? "Listing: " + args.listingTitle + "\n" : "") +
      "Top offer: " + dollars + "\n\n" +
      url,
    html,
  });
}
