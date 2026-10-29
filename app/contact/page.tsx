import type { Metadata } from "next";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight, FiMail, FiMapPin } from "react-icons/fi";
import { contact, whatsappLink } from "@/lib/site";
import RevealText from "../components/motion/RevealText";
import ContactWizard from "../components/contact/ContactWizard";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell VyxrLabs how your business runs today. Message us on WhatsApp, email support@vyxrlabs.com, or send a project brief.",
};

const channels: { label: string; value: string; href: string; icon: IconType; external?: boolean }[] = [
  {
    label: "WhatsApp",
    value: contact.whatsappDisplay,
    href: whatsappLink("Hi VyxrLabs, I'd like to talk about a project."),
    icon: FaWhatsapp,
    external: true,
  },
  { label: "Email", value: contact.email, href: `mailto:${contact.email}`, icon: FiMail },
  { label: "Office", value: contact.office, href: contact.mapsUrl, icon: FiMapPin, external: true },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  const { need } = await searchParams;
  return (
    <section className="relative overflow-hidden pb-28 pt-40 sm:pt-48">
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(45% 55% at 15% 0%, rgb(80 109 254 / 0.22), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <RevealText as="h1" immediate className="display text-[clamp(3rem,8vw,8rem)] lg:col-span-8">
            Let&apos;s build your <span className="accent">system.</span>
          </RevealText>
          <p className="max-w-sm text-lg text-muted lg:col-span-4 lg:pb-4">
            Tell us how your business runs today. We&apos;ll show you how it could run tomorrow.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-5">
            {channels.map(({ label, value, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-ink-2 p-4 transition-colors hover:border-signal/60"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-signal/15 text-signal-hi">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block">{label}</span>
                  <span className="block text-lg leading-snug [overflow-wrap:anywhere]">{value}</span>
                </span>
                <FiArrowUpRight
                  className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                  aria-hidden
                />
              </a>
            ))}
            <p className="pt-4 text-muted">
              Prefer to talk it through? Message us on WhatsApp and we&apos;ll set up a call.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactWizard initialNeed={need} />
          </div>
        </div>
      </div>
    </section>
  );
}
