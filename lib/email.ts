export type ResetEmailPayload = {
  to: string;
  resetUrl: string;
};

export async function sendResetEmail(payload: ResetEmailPayload): Promise<void> {
  // Build-safe stub. Replace with nodemailer provider when ready.
  console.log("[email] sendResetEmail stub:", payload);
}
