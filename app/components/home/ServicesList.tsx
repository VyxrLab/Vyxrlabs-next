"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { services } from "@/lib/site";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import RevealText from "../motion/RevealText";

export default function ServicesList() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // Desktop: pin the section and let scroll step through the services.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const st = ScrollTrigger.create({
          trigger: "[data-services-pin]",
          start: "top top",
          end: `+=${services.length * 55}%`,
          pin: true,
          onUpdate: (self) =>
            setActive(Math.min(services.length - 1, Math.floor(self.progress * services.length))),
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const current = services[active];

  return (
    <section ref={root} id="services" aria-labelledby="services-heading">
      <div data-services-pin className="container-x flex min-h-svh flex-col justify-center py-24">
        <p className="eyebrow mb-6">{"// What we build"}</p>
        <RevealText id="services-heading" className="display-tight mb-14 max-w-3xl text-[clamp(2rem,4.4vw,4rem)]">
          Software that pays for itself.
        </RevealText>

        <div className="grid gap-12 lg:grid-cols-12">
          <ul className="lg:col-span-7">
            {services.map((s, i) => (
              <li key={s.slug} className="border-t border-line last:border-b">
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`display-tight w-full py-5 text-left text-[clamp(1.8rem,3.6vw,3.4rem)] transition-colors duration-500 ${
                    active === i ? "text-fg" : "text-fg lg:text-fg/25 lg:hover:text-fg/60"
                  }`}
                >
                  {s.title}
                </button>
                {/* Mobile: details inline */}
                <div className="pb-6 lg:hidden">
                  <p className="text-muted">{s.short}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {s.outcomes.map((o) => (
                      <li key={o} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: details panel for the active service */}
          <div className="hidden lg:col-span-5 lg:block" aria-live="polite">
            <div key={current.slug} className="animate-fade-in rounded-[28px] border border-line bg-ink-2 p-8">
              <p className="text-xl leading-snug">{current.short}</p>
              <ul className="mt-6 space-y-3 text-muted">
                {current.outcomes.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
                    {o}
                  </li>
                ))}
              </ul>
              {current.example && (
                <p className="mt-6 border-t border-line pt-5 text-sm text-muted">
                  <span className="text-fg">Example: </span>
                  {current.example}
                </p>
              )}
              <Link href={`/services#${current.slug}`} className="btn-ghost mt-8">
                How we do it
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
