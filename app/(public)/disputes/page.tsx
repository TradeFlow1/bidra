import { PLATFORM_LANGUAGE } from "@/lib/platform-language";
import { BackButton } from "@/components/ui/back-button";

export const metadata = { title: "Bidra | Disputes & Resolution" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mx-auto mb-4 w-full max-w-6xl px-4"><BackButton href="/support" label="Back to support" /></div>
      <h1 className="text-2xl font-semibold">Disputes & Resolution</h1>

      <div className="mt-4 space-y-4 text-sm leading-6 opacity-90">
        <p>
          {PLATFORM_LANGUAGE.notParty} {PLATFORM_LANGUAGE.noGuarantee}
        </p>

        <p>
          Keep evidence such as messages, listing links, screenshots, and order details. Contact Support if you need platform review or need to report rule-breaking behaviour.
        </p>

        <p>
          {PLATFORM_LANGUAGE.payments}
        </p>
      </div>
    </main>
  );
}
