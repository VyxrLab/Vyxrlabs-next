"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { services, type Service } from "@/lib/site";
import { ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "../motion/SmoothScroll";
import RevealText from "../motion/RevealText";
import type { ServicesTrack } from "./ServicesScene";
import type { ShapeKind } from "./serviceShapes";

const ServicesScene = dynamic(() => import("./ServicesScene"), { ssr: false });

/** The dot object that stands for each service. */
const shapeFor: Record<string, ShapeKind> = {
  "custom-solutions": "blocks",
  automation: "gears",
  saas: "layers",
  ai: "network",
};
const fallbackShapes: ShapeKind[] = ["blocks", "gears", "layers", "network"];
const kinds = services.map((s, i) => shapeFor[s.slug] ?? fallbackShapes[i % fallbackShapes.length]);

/** How far right of centre the first service starts, so it glides in while the section scrolls into view. */
const LEAD = 0.8;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);

/**
 * The four services travel along an arc as dot-built objects while the section is held on screen.
 * Reduced motion gets the same content as a plain stacked list.
 */
export default function ServicesList() {
  return useReducedMotion() ? <ServicesStack /> : <ServicesArc />;
}

function ServicesArc() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<ServicesTrack>({ pos: -LEAD, enter: 0 });
  const band = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const last = services.length - 1;
    let entering = 0;
    let travelling = 0;
    const sync = () => {
      const pos = -LEAD * (1 - entering) + travelling * last;
      track.current.pos = pos;
      track.current.enter = entering;
      setActive(Math.min(last, Math.max(0, Math.round(pos))));
    };
    const enter = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "top top",
      onUpdate: (self) => {
        entering = self.progress;
        sync();
      },
      onRefresh: (self) => {
        entering = self.progress;
        sync();
      },
    });
    const travel = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        travelling = self.progress;
        sync();
      },
      onRefresh: (self) => {
        travelling = self.progress;
        sync();
      },
    });
    return () => {
      enter.kill();
      travel.kill();
    };
  }, []);

  // Scroll to where a service sits at the centre of the arc.
  const goTo = (i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (i / (services.length - 1)) * (el.offsetHeight - window.innerHeight);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section ref={root} id="services" aria-labelledby="services-heading" className="relative h-[320vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Glow shown before WebGL loads, and as the fallback without it */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${ready && webgl ? "opacity-0" : "opacity-100"}`}
          style={{ background: "radial-gradient(30% 34% at 50% 46%, rgb(80 109 254 / 0.24), transparent 70%)" }}
          aria-hidden
        />
        {webgl && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <ServicesScene
              kinds={kinds}
              track={track}
              band={band}
              onReady={() => setReady(true)}
              onFail={() => setWebgl(false)}
            />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent"
          aria-hidden
        />

        <div className="container-x relative flex h-full flex-col pb-8 pt-24 sm:pb-10 sm:pt-28">
          <div className="flex items-start justify-between gap-10">
            <div>
              <p className="eyebrow mb-4">{"// What we build"}</p>
              <RevealText id="services-heading" className="display-tight max-w-3xl text-[clamp(1.8rem,3.4vw,3.2rem)]">
                Software that pays for itself.
              </RevealText>
            </div>
            <ul className="hidden shrink-0 pt-1 text-sm lg:block" aria-label="Jump to a service">
              {services.map((s, i) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active === i ? "true" : undefined}
                    className={`flex items-center gap-2.5 py-1 transition-colors duration-500 ${
                      active === i ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-signal transition-transform duration-500 ease-out-expo ${
                        active === i ? "scale-100" : "scale-0"
                      }`}
                      aria-hidden
                    />
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* The scene fits the centre object into this space. */}
          <div ref={band} className="min-h-0 flex-1" aria-hidden />

          {/* Every service is in the page; only the one at the centre of the arc is shown. */}
          <div className="grid [&>*]:[grid-area:1/1]">
            {services.map((s, i) => (
              <ServiceDetail key={s.slug} service={s} active={active === i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesStack() {
  return (
    <section id="services" aria-labelledby="services-heading" className="container-x py-24 sm:py-32">
      <p className="eyebrow mb-4">{"// What we build"}</p>
      <h2 id="services-heading" className="display-tight mb-12 max-w-3xl text-[clamp(1.8rem,3.4vw,3.2rem)]">
        Software that pays for itself.
      </h2>
      <div className="divide-y divide-line border-y border-line">
        {services.map((s) => (
          <div key={s.slug} className="py-10">
            <ServiceDetail service={s} active />
          </div>
        ))}
      </div>
    </section>
  );
}

// Shared by the parts of a service that fade up after its title rises.
const fade =
  "translate-y-3 opacity-0 transition-[opacity,transform] duration-300 ease-out-expo group-data-[active=true]:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:duration-700";

function ServiceDetail({ service: s, active }: { service: Service; active: boolean }) {
  return (
    <article
      data-active={active}
      inert={!active}
      aria-labelledby={`service-${s.slug}`}
      className="group grid items-end gap-x-10 gap-y-5 lg:grid-cols-12"
    >
      <div className="lg:col-span-5">
        <h3 id={`service-${s.slug}`} className="display-tight overflow-hidden pb-1 text-[clamp(1.9rem,3.6vw,3.4rem)]">
          <span className="block translate-y-[110%] transition-transform duration-300 ease-out-expo group-data-[active=true]:translate-y-0 group-data-[active=true]:delay-100 group-data-[active=true]:duration-1000">
            {s.title}
          </span>
        </h3>
        <p className={`${fade} mt-3 max-w-md text-muted group-data-[active=true]:delay-200 sm:text-lg`}>{s.short}</p>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        <ul
          className={`${fade} grid gap-x-8 gap-y-2 text-sm group-data-[active=true]:delay-300 sm:grid-cols-2 max-lg:[@media(max-height:740px)]:hidden`}
        >
          {s.outcomes.map((o) => (
            <li key={o} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
        <div
          className={`${fade} mt-5 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-5 group-data-[active=true]:delay-[400ms]`}
        >
          {/* Link first: the floating WhatsApp button sits over the bottom-right corner. */}
          <Link href={`/services#${s.slug}`} className="btn-ghost">
            How we do it
          </Link>
          {s.example && (
            <p className="hidden max-w-sm flex-1 text-sm text-muted sm:block">
              <span className="text-fg">Example: </span>
              {s.example}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
