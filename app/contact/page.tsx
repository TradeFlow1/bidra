import Link from "next/link";
import { auth } from "@/lib/auth";
import ContactForm from "./contact-form";

const supportRoutes = [
  { title: "General help", body: "Buying, selling, offers, messages and account setup.", href: "/help" },
  { title: "Safety and reports", body: "No-shows, unsafe behaviour, suspicious listings and disputes.", href: "/support" },
  { title: "Legal and rules", body: "Terms, privacy, fees and prohibited items.", href: "/legal" },
];

export default async function ContactPage() {
  const session = await auth();
  const defaultEmail = session?.user?.email ? String(session.user.email) : "";

  return (
    <main className="bg-white text-[#07152E]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[34px] border border-[#D8E6F8] bg-[#EEF6FF] p-6 shadow-[0_20px_60px_rgba(32,75,140,0.10)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-[#4F46E5]">Contact</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#07152E] sm:text-6xl">Contact Bidra</h1>
          <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-[#475569]">Send a message for product feedback, account help, suspicious behaviour, reports or marketplace issues.</p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
          <ContactForm defaultEmail={defaultEmail} />

          <aside className="space-y-4">
            {supportRoutes.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-[24px] border border-[#D8E1F0] bg-white p-5 shadow-sm transition">
                <h2 className="text-lg font-black tracking-[-0.03em] text-[#07152E]">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#475569]">{item.body}</p>
                <span className="mt-4 inline-flex text-sm font-black text-[#4F46E5]">Open →</span>
              </Link>
            ))}
          </aside>
        </section>
      </div>
    </main>
  );
}
