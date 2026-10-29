"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;

/** The running Lenis instance, or null when smooth scroll is off (reduced motion / before mount). */
export const getLenis = () => lenisInstance;

/** Jump straight to a #section or y position, e.g. while the page transition hides the move. */
export function jumpTo(target: string | number) {
  const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : null;
  const y = typeof target === "number" ? target : 0;
  if (lenisInstance) {
    lenisInstance.scrollTo(el ?? y, { offset: el ? -24 : 0, immediate: true, force: true });
    return;
  }
  if (el) el.scrollIntoView();
  else window.scrollTo({ top: y });
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // New page: start at the top (or at the hash target) and re-measure triggers.
  useEffect(() => {
    const hash = window.location.hash;
    requestAnimationFrame(() => jumpTo(hash || 0));
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
