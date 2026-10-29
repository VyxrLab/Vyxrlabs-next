"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { gsap, useGSAP, MOTION_OK, ScrollTrigger } from "@/lib/gsap";
import { stats } from "@/lib/site";
import RevealText from "../motion/RevealText";
import Magnetic from "../motion/Magnetic";
import { transitionTo } from "../motion/PageTransition";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

const captions = [
  "We build inside the tools you already run on: your CRM, your inbox, your phone lines.",
  "So every lead, message and call flows through one system that works for you.",
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState(true);

  // Scroll progress through the hero feeds the particle morph.
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => (progress.current = self.progress),
    });
    return () => st.kill();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-hero-fade]", { opacity: 0, y: 24, duration: 1.2, ease: "expo.out", stagger: 0.1, delay: 0.5 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        tl.to("[data-hero-intro]", { opacity: 0, y: -80, ease: "none", duration: 0.22 }, 0)
          .fromTo("[data-caption='0']", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.12 }, 0.24)
          .to("[data-caption='0']", { opacity: 0, y: -40, duration: 0.12 }, 0.48)
          .fromTo("[data-caption='1']", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.12 }, 0.6)
          .to("[data-caption='1']", { opacity: 0, y: -40, duration: 0.12 }, 0.88);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative h-[260vh] motion-reduce:h-svh">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Glow shown before WebGL loads, and as the fallback without it */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${ready && webgl ? "opacity-0" : "opacity-100"}`}
          style={{
            background:
              "radial-gradient(40% 45% at 62% 42%, rgb(80 109 254 / 0.35), transparent 70%), radial-gradient(25% 30% at 62% 42%, rgb(157 176 255 / 0.25), transparent 70%)",
          }}
          aria-hidden
        />
        {webgl && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
            <ParticleField progress={progress} onReady={() => setReady(true)} onFail={() => setWebgl(false)} />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent"
          aria-hidden
        />

        {/* Intro: fades away as the particles start to morph */}
        <div data-hero-intro className="container-x relative flex h-full flex-col justify-end pb-8 pt-28 sm:pb-10">
          <p data-hero-fade className="eyebrow mb-6">
            {"// Custom software studio in the UAE"}
          </p>
          <div className="grid items-end gap-8 lg:grid-cols-12">
            <RevealText
              as="h1"
              immediate
              delay={0.2}
              className="display text-[clamp(2.4rem,min(8.4vw,13svh),8.6rem)] lg:col-span-8"
            >
              {/* Punctuation sits inside the accents so a line can't start with a stray comma. */}
              Custom software that <span className="accent">sells,</span>{" "}
              <span className="accent">automates</span> &amp; <span className="accent">scales.</span>
            </RevealText>
            <div className="lg:col-span-4 lg:pb-3">
              <p
                data-hero-fade
                className="max-w-md text-base leading-relaxed text-muted sm:text-lg [@media(max-height:640px)]:hidden"
              >
                We build custom products, automations, SaaS platforms and AI that plug into how your
                business already runs, so you sell more and spend less time doing it.
              </p>
              <div data-hero-fade className="mt-6 flex flex-wrap gap-3">
                <Magnetic>
                  <Link href="/contact" className="btn-primary">
                    Start a project
                  </Link>
                </Magnetic>
                <button type="button" onClick={() => transitionTo("#work")} className="btn-ghost">
                  See our work
                </button>
              </div>
            </div>
          </div>

          <div
            data-hero-fade
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5 text-sm sm:pr-20 [@media(max-height:640px)]:hidden"
          >
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5 text-signal-hi" aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <FaStar key={i} className="h-3 w-3" aria-hidden />
                ))}
              </span>
              <span>
                <strong className="font-medium">{stats[0].value}</strong>{" "}
                <span className="text-muted">{stats[0].label}</span>
              </span>
            </span>
            <span>
              <strong className="font-medium">{stats[1].value}</strong>{" "}
              <span className="text-muted">{stats[1].label}</span>
            </span>
            <span>
              <strong className="font-medium">{stats[2].value}</strong>{" "}
              <span className="text-muted">{stats[2].label}</span>
            </span>
            <span className="ml-auto hidden items-center gap-3 text-muted sm:flex" aria-hidden>
              Scroll
              <span className="relative h-8 w-px overflow-hidden bg-line">
                <span className="absolute inset-0 animate-scroll-cue bg-signal-hi" />
              </span>
            </span>
          </div>
        </div>

        {/* Captions that play over the morph */}
        {captions.map((text, i) => (
          <p
            key={i}
            data-caption={i}
            className="display-tight pointer-events-none absolute inset-x-0 bottom-[14vh] mx-auto max-w-4xl px-6 text-center text-[clamp(1.6rem,3.6vw,3.2rem)] opacity-0 motion-reduce:hidden"
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
