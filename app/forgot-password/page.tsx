export const metadata = {
  title: "Bidra | Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="bd-container py-10">
      <div className="container max-w-5xl">
        <div className="bd-card p-5 max-w-md">
          <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Forgot password</h1>
          <p className="mt-2 text-sm bd-ink2">
            Enter your email address and we’ll send you a reset link.
          </p>

          <form method="post" action="/api/auth/reset-password" className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
              />
            </div>

            <button type="submit" className="bd-btn bd-btn-primary w-full">
              Send reset link
            </button>
          </form>
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
