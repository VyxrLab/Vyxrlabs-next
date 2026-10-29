import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/site";
import RevealText from "../components/motion/RevealText";
import BlackSwan from "../components/work/BlackSwan";
import Testimonials from "../components/testimonials/Testimonials";
import CtaBand from "../components/sections/CtaBand";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Custom solutions and products, business automation, custom SaaS platforms and custom AI, built around how your business runs.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-40 sm:pt-48">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(50% 60% at 80% 0%, rgb(80 109 254 / 0.22), transparent 70%)" }}
          aria-hidden
        />
        <div className="container-x relative">
          <p className="eyebrow mb-6">{"// Services"}</p>
          <RevealText as="h1" immediate className="display max-w-5xl text-[clamp(2.8rem,7.4vw,7.4rem)]">
            Systems built around your business.
          </RevealText>
          <p className="mt-8 max-w-2xl text-lg text-muted">
            Everything we build has one job: help you make more money and spend less time doing it. Here&apos;s
            what that looks like.
          </p>
          <nav aria-label="Services on this page" className="mt-12 flex flex-wrap gap-2">
            {services.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="btn-ghost px-4 py-2">
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {services.map((s) => (
        <section
          key={s.slug}
          id={s.slug}
          aria-labelledby={`${s.slug}-heading`}
          className="container-x grid scroll-mt-24 gap-10 border-t border-line py-20 sm:py-28 lg:grid-cols-12"
        >
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <RevealText id={`${s.slug}-heading`} className="display-tight text-[clamp(2.2rem,4.4vw,4rem)]">
                {s.title}
              </RevealText>
              <p className="mt-5 max-w-md text-lg text-muted">{s.short}</p>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-xl leading-relaxed text-fg/90">{s.pitch}</p>
            <h3 className="eyebrow mb-4 mt-10">What you get</h3>
            <ul className="divide-y divide-line border-y border-line">
              {s.outcomes.map((o) => (
                <li key={o} className="flex items-center gap-4 py-4 text-lg">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-signal" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
            {s.example && (
              <p className="mt-8 rounded-2xl border border-line bg-ink-2 p-5 text-muted">
                <span className="text-fg">Example: </span>
                {s.example}
              </p>
            )}
            <Link href={`/contact?need=${s.slug}`} className="btn-primary mt-10">
              Discuss {s.title}
            </Link>
          </div>
        </section>
      ))}

      <BlackSwan />
      <Testimonials />
      <CtaBand />
    </>
  );
}
