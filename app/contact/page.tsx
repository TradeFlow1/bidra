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
    <main className="bg-[#FCFBFE] text-[#17131F]">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-10 sm:px-8">
        <section className="rounded-[28px] border border-[#E8E2EF] bg-[#F7F5FA] p-6 shadow-[0_10px_28px_rgba(15,12,22,0.04)] sm:p-8">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#6F3FF5]">Contact</div>
          <h1 className="mt-4 text-5xl font-black leading-none tracking-[-0.06em] text-[#17131F] sm:text-6xl">Contact Bidra</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[#4F475D]">Send a message for product feedback, account help, suspicious behaviour, reports or marketplace issues.</p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_380px]">
          <ContactForm defaultEmail={defaultEmail} />

          <aside className="space-y-4">
            {supportRoutes.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-[20px] border border-[#E8E2EF] bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
                <h2 className="text-lg font-black tracking-[-0.03em] text-[#17131F]">{item.title}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#4F475D]">{item.body}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-[#6F3FF5]">Open →</span>
              </Link>
            ))}
          </aside>
        </section>
      </div>
    </main>
  );
}
