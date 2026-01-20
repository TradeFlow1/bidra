import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";

const STATES = ["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"] as const;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: { saved?: string };
}) {
  const session = await auth();
  const user = session?.user as any;
  if (!user?.id) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/auth/login");

  const saved = String(searchParams?.saved ?? "") === "1";
  const failed = String(searchParams?.saved ?? "") === "0";

  async function update(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { prisma } = await import("@/lib/prisma");
    const { redirect } = await import("next/navigation");

    const s = await auth();
    const u = s?.user as any;
    if (!u?.id) redirect("/auth/login");

    const name = String(formData.get("name") ?? "").trim().slice(0, 60);
    const bio = String(formData.get("bio") ?? "").trim().slice(0, 280);

    const postcode = String(formData.get("postcode") ?? "").trim().slice(0, 10);
    const suburb = String(formData.get("suburb") ?? "").trim().slice(0, 60);
    const state = String(formData.get("state") ?? "").trim().slice(0, 10);

const payidEmail = String(formData.get("payidEmail") ?? "").trim().slice(0, 120);
const payidMobile = String(formData.get("payidMobile") ?? "").trim().slice(0, 32);

const bankName = String(formData.get("bankName") ?? "").trim().slice(0, 80);
const bankBsb = String(formData.get("bankBsb") ?? "").trim().slice(0, 16);
const bankAccount = String(formData.get("bankAccount") ?? "").trim().slice(0, 32);

    const hasPostcode = postcode.length > 0;
    const hasSuburb = suburb.length > 0;
    const hasState = state.length > 0;

    // Rule: postcode OR (suburb + state). No street address.
    if (!hasPostcode && !(hasSuburb && hasState)) {
      redirect("/profile?saved=0");
    }

    // If suburb entered, state must be present (even if postcode exists)
    if (hasSuburb && !hasState) {
      redirect("/profile?saved=0");
    }

        // ---- Payout details validation (optional) ----
    const payidEmailNorm = payidEmail.trim();
    const payidMobileDigits = payidMobile.replace(/[^\d]/g, "");
    const bankBsbDigits = bankBsb.replace(/[^\d]/g, "");
    const bankAccountDigits = bankAccount.replace(/[^\d]/g, "");

    const hasPayidEmail = payidEmailNorm.length > 0;
    const hasPayidMobile = payidMobileDigits.length > 0;

    const hasBankName = bankName.trim().length > 0;
    const hasBankBsb = bankBsbDigits.length > 0;
    const hasBankAccount = bankAccountDigits.length > 0;

    // PayID email: basic shape check
    if (hasPayidEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payidEmailNorm)) {
      redirect("/profile?saved=0");
    }

    // PayID mobile: AU mobile 04xxxxxxxx (10 digits total)
    if (hasPayidMobile) {
      if (!(payidMobileDigits.length === 10 && payidMobileDigits.startsWith("04"))) {
        // PayID mobile must be an AU mobile number
        redirect("/profile?saved=0");
      }
    }

    // Bank: if any bank field provided, require BSB + account and validate lengths
    if (hasBankName || hasBankBsb || hasBankAccount) {
      if (!hasBankBsb || !hasBankAccount) {
        redirect("/profile?saved=0");
      }
      if (bankBsbDigits.length !== 6) {
        redirect("/profile?saved=0");
      }
      if (bankAccountDigits.length < 6 || bankAccountDigits.length > 12) {
        redirect("/profile?saved=0");
      }
    }

    await prisma.user.update({
      where: { id: u.id },
      data: {
        name: name || null,
        bio: bio || null,
        postcode: hasPostcode ? postcode : null,
        suburb: hasSuburb ? suburb : null,
        state: hasState ? state : null,
        country: "AU",
        payidEmail: payidEmail || null,
        payidMobile: (payidMobileDigits || "") ? payidMobileDigits : null,
        bankName: bankName || null,
        bankBsb: (bankBsbDigits || "") ? bankBsbDigits : null,
        bankAccount: (bankAccountDigits || "") ? bankAccountDigits : null,
      },
    });

    redirect("/profile?saved=1");
  }

  return (
    <main className="bd-container py-10"><div className="container max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-center bd-ink">Account settings</h1>

      <div className="mt-5 flex justify-center gap-3">
        <a
          href="/forgot-password"
          className="bd-btn bd-btn-ghost"
        >
          Reset password
        </a>
        <a
          href="/logout"
          className="bd-btn bd-btn-ghost"
        >
          Log out
        </a>
      </div>

      {saved ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <div className="font-semibold">Profile updated successfully.</div>
          <div className="mt-1">
            <a href="/profile" className="underline underline-offset-4 font-semibold bd-ink hover:opacity-90">
              Dismiss
            </a>
          </div>
        </div>
      ) : null}

      {failed ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <div className="font-semibold">Please fix your location.</div>
          <div className="mt-1">Enter <strong>postcode</strong> OR <strong>suburb + state</strong>. (No street address)</div>
        </div>
      ) : null}


      <div className="mt-6 space-y-4">
        <Card>
          <div className="text-sm bd-ink2">Email</div>
          <div className="font-semibold">{dbUser.email}</div>
          <div className="mt-2 text-sm">
            Verification:{" "}
            {dbUser.emailVerified ? (
              <span className="text-emerald-700 font-semibold">Verified</span>
            ) : (
              <span className="text-amber-700 font-semibold">Not verified</span>
            )}
          </div>
        </Card>

        <Card>
          <form action={update} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Display name</label>
              <Input name="name" defaultValue={dbUser.name ?? ""} placeholder="e.g. Jordan" />
            </div>

            <div>
              <label className="text-sm font-medium">Bio (optional)</label>
              <Input name="bio" defaultValue={(dbUser as any).bio ?? ""} placeholder="A short intro (optional)" />
            </div>

            <div className="bd-card p-5">
              <div className="text-sm font-semibold">Location</div>
<div className="mt-1 text-xs bd-ink2">Use your <strong>postcode</strong> (fastest) OR your <strong>suburb + state</strong>. If you enter a suburb, you must choose a state.</div>
              <div className="mt-1 text-sm bd-ink2">
                Use <span className="font-semibold">postcode</span> OR <span className="font-semibold">suburb + state</span>. (No street address)
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                <div className="sm:col-span-1">
                  <label className="text-sm font-medium">Postcode</label>
                  <Input name="postcode" defaultValue={(dbUser as any).postcode ?? ""} placeholder="e.g. 4301" />
                </div>

                <div className="hidden sm:flex items-center justify-center text-xs bd-ink2">
                  OR
                </div>

                <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Suburb</label>
                    <Input name="suburb" defaultValue={(dbUser as any).suburb ?? ""} placeholder="e.g. Redbank Plains" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">State</label>
                    <select
                      name="state"
                      defaultValue={(dbUser as any).state ?? ""}
                      className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm bd-ink"
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Avatar URL (optional)</label>
            </div>

            <div className="bd-card p-5">
  <div className="text-sm font-semibold">Payout details</div>
  <div className="mt-1 text-xs bd-ink2">Optional — only needed if selling.</div>

  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div>
      <label className="text-sm font-medium">PayID email (optional)</label>
      <Input name="payidEmail" defaultValue={(dbUser as any).payidEmail ?? ""} placeholder="e.g. you@example.com" />
      <div className="mt-1 text-xs bd-ink2">Use this if you receive PayID payments to your email.</div>
    </div>

    <div>
      <label className="text-sm font-medium">PayID mobile (optional)</label>
      <Input name="payidMobile" defaultValue={(dbUser as any).payidMobile ?? ""} placeholder="e.g. 04xx xxx xxx" />
      <div className="mt-1 text-xs bd-ink2">Most Australians use mobile PayID — add it here if preferred.</div>
    </div>
  </div>

  <div className="mt-4">
    <div className="text-sm font-medium">Bank transfer fallback (optional)</div>

    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="sm:col-span-1">
        <label className="text-sm font-medium">Bank name</label>
        <Input name="bankName" defaultValue={(dbUser as any).bankName ?? ""} placeholder="e.g. Commonwealth Bank" />
      </div>

      <div className="sm:col-span-1">
        <label className="text-sm font-medium">BSB</label>
        <Input name="bankBsb" defaultValue={(dbUser as any).bankBsb ?? ""} placeholder="e.g. 062-000" />
      </div>

      <div className="sm:col-span-1">
        <label className="text-sm font-medium">Account number</label>
        <Input name="bankAccount" defaultValue={(dbUser as any).bankAccount ?? ""} placeholder="e.g. 12345678" />
      </div>
    </div>

    <div className="mt-2 text-xs bd-ink2">Used only if PayID isn’t available for a sale.</div>
  </div>
</div>
<div className="bd-card p-5">
  <div className="text-sm font-semibold">Security</div>
  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
    <a className="bd-btn bd-btn-ghost" href="/forgot-password">
      Reset password
    </a>
    <a className="bd-btn bd-btn-ghost" href="/logout">
      Log out
    </a>
  </div>
</div>

<Button type="submit" className="bd-btn bd-btn-primary w-full text-center">
              Save changes
            </Button>

            <div className="text-xs bd-ink2 text-center">
              Privacy-first: we only store general area (suburb/state/postcode). No street addresses.
            </div>
          </form>
        </Card>
      </div>
    </div></main>
  );
}

