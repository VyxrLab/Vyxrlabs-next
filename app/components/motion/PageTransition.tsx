"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MARK_CENTER, MARK_CORE, MARK_PATH, MARK_SIZE } from "../brand/mark";
import { jumpTo } from "./SmoothScroll";

let start: ((url: URL) => void) | null = null;

/** Go to a page or section through the logo transition, e.g. "/contact" or "#work". */
export function transitionTo(href: string) {
  const url = new URL(href, window.location.href);
  if (start) start(url);
  else window.location.assign(url);
}

/**
 * Every move to another page or section passes through the mark: it grows out of the centre until it
 * fills the screen, the move happens underneath, then a mark-shaped window opens and widens until the
 * new view is all that's left.
 *
 * Same-site links are picked up automatically; buttons call `transitionTo`.
 */
export default function PageTransition() {
  const router = useRouter();
  const [pending, startNavigation] = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const grow = useRef<SVGGElement>(null);
  const hole = useRef<SVGGElement>(null);
  const cover = useRef<SVGRectElement>(null);
  const arrive = useRef<(() => void) | null>(null);

  // A route change has arrived once React has committed the new page.
  useEffect(() => {
    if (pending || !arrive.current) return;
    const done = arrive.current;
    arrive.current = null;
    done();
  }, [pending]);

  useEffect(() => {
    const el = root.current;
    const growEl = grow.current;
    const holeEl = hole.current;
    const coverEl = cover.current;
    if (!el || !growEl || !holeEl || !coverEl) return;
    let busy = false;

    // Scale the mark about the screen centre. `anchor` slides the pinned point from the mark's middle
    // (so it looks centred while small) to its deepest point (so it fills the screen when large).
    const place = (g: SVGGElement, scale: number, anchor: number) => {
      const ax = MARK_CENTER.x + (MARK_CORE.x - MARK_CENTER.x) * anchor;
      const ay = MARK_CENTER.y + (MARK_CORE.y - MARK_CENTER.y) * anchor;
      g.setAttribute(
        "transform",
        `translate(${innerWidth / 2} ${innerHeight / 2}) scale(${scale}) translate(${-ax} ${-ay})`,
      );
    };
    const sizes = () => ({
      small: Math.min(innerHeight * 0.2, 150) / MARK_SIZE.height,
      // Just past the scale where the mark's thickest point spans the whole screen.
      full: (Math.hypot(innerWidth, innerHeight) / 2 / MARK_CORE.radius) * 1.1,
    });
    // Zoom on a log scale so the growth reads as steady rather than exploding at the very end.
    const zoom = (g: SVGGElement, from: number, to: number) => {
      const p = { u: 0 };
      return { p, update: () => place(g, from * Math.pow(to / from, p.u), Math.min(1, p.u * 2.2)) };
    };

    const isSamePage = (url: URL) => url.pathname === location.pathname && url.search === location.search;

    const navigate = (url: URL) =>
      new Promise<void>((resolve) => {
        if (isSamePage(url)) {
          history.replaceState(history.state, "", url.hash || url.pathname + url.search);
          resolve();
          return;
        }
        const fallback = window.setTimeout(() => {
          arrive.current = null;
          resolve();
        }, 6000);
        arrive.current = () => {
          window.clearTimeout(fallback);
          resolve();
        };
        startNavigation(() => router.push(url.pathname + url.search + url.hash, { scroll: false }));
      });

    start = async (url) => {
      if (busy) return;
      busy = true;
      const samePage = isSamePage(url);
      // Start loading the next page now, so it's ready by the time the screen is covered.
      if (!samePage) router.prefetch(url.pathname + url.search);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const { small, full } = sizes();
      place(holeEl, 0, 0);
      el.style.visibility = "visible";

      // Cover: one accelerating zoom, from a small mark to a full screen.
      if (reduced) {
        await gsap.fromTo(coverEl, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      } else {
        const grower = zoom(growEl, small * 0.5, full);
        gsap.set(coverEl, { opacity: 0 });
        await gsap
          .timeline()
          .fromTo(growEl, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0)
          .to(grower.p, { u: 1, duration: 0.7, ease: "power2.in", onUpdate: grower.update }, 0)
          .set(coverEl, { opacity: 1 })
          .set(growEl, { opacity: 0 });
      }

      // The move happens under the cover. A section on this page is an instant jump; another page
      // only holds the cover for as long as it still needs to arrive.
      await navigate(url);
      // The new page has committed by now, so its scroll triggers can be measured straight away.
      if (!samePage) ScrollTrigger.refresh();
      jumpTo(url.hash || 0);

      // Reveal: a mark-shaped window opens at the speed the cover ended on, then eases out past the
      // screen's edges, so cover and reveal read as one movement.
      if (reduced) {
        await gsap.to(coverEl, { opacity: 0, duration: 0.25 });
      } else {
        const opener = zoom(holeEl, small * 0.6, full);
        await gsap.to(opener.p, { u: 1, duration: 0.8, ease: "power2.out", onUpdate: opener.update });
      }
      gsap.set(coverEl, { opacity: 0 });
      el.style.visibility = "hidden";
      busy = false;
    };

    // Same-site links (pages and #sections) go through the transition instead of jumping.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      if (link.dataset.transition === "off") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      start?.(url);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      start = null;
    };
  }, [router]);

  return (
    <div ref={root} aria-hidden className="fixed inset-0 z-[100]" style={{ visibility: "hidden" }}>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="transition-window" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="white" />
            <g ref={hole}>
              <path d={MARK_PATH} fill="black" />
            </g>
          </mask>
        </defs>
        <rect ref={cover} width="100%" height="100%" mask="url(#transition-window)" opacity="0" className="fill-signal" />
        <g ref={grow} opacity="0">
          <path d={MARK_PATH} className="fill-signal" />
        </g>
      </svg>
    </div>
  );
}
