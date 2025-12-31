import { PLATFORM_LANGUAGE } from "@/lib/platform-language";

export const metadata = { title: "Bidra | Privacy Policy" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>

      <div className="mt-4 space-y-4 text-sm leading-6 opacity-90">
        <p>
          {PLATFORM_LANGUAGE.notParty} {PLATFORM_LANGUAGE.noGuarantee}
        </p>

        <p>
          This page is provided for transparency and user understanding. It does not replace professional advice.
        </p>

        <p>
          {PLATFORM_LANGUAGE.payments}
        </p>
      </div>
    </main>
  );
}
