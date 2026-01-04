export const metadata = {
  title: "Bidra | Reset password",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = String(searchParams?.token ?? "");

  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="bd-card p-5 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Reset password</h1>
          <p className="mt-2 text-sm bd-ink2">
            Choose a new password for your account.
          </p>

          {!token ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-white p-4 text-sm bd-ink2">
              Missing reset token. Please use the link from your email.
            </div>
          ) : (
            <form method="post" action="/api/auth/reset-password/confirm" className="mt-6 space-y-4">
              <input type="hidden" name="token" value={token} />

              <div>
                <label className="text-sm font-medium">New password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
                />
                <div className="mt-1 text-xs bd-ink2">Minimum 8 characters.</div>
              </div>

              <button type="submit" className="bd-btn bd-btn-primary w-full">
                Set new password
              </button>
            </form>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <a className="bd-link" href="/auth/login">Back to login</a>
            <span className="text-black/20">•</span>
            <a className="bd-link" href="/legal/privacy">Privacy</a>
            <span className="text-black/20">•</span>
            <a className="bd-link" href="/legal/terms">Terms</a>
          </div>
        </div>
      </div>
    </main>
  );
}
