"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";
import { client, products } from "@/lib/site";
import { gsap } from "@/lib/gsap";
import { useModal } from "../ui/useModal";
import CardFace from "./CardFace";
import ProductSlide from "./ProductSlide";

/** Where a card sits on screen right now, so the sheet can grow out of it and shrink back into it. */
export type CardRect = { left: number; top: number; width: number; height: number; rotation: number };

type Props = {
  index: number;
  onIndex: (i: number) => void;
  getOrigin: (i: number) => CardRect;
  /** The card to focus once the sheet has shrunk back into it. */
  getCard: (i: number) => HTMLElement | null;
  onClosed: () => void;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Full-screen sheet for one Swan tool. It opens out of the card that was clicked, like the card unfolding.
 * The arrows, the ← → keys and a sideways swipe move between tools: the next one wipes in from the side
 * you're heading towards while the current one drifts away underneath.
 */
export default function ProductSheet({ index, onIndex, getOrigin, getCard, onClosed }: Props) {
  const p = products[index];
  const prev = (index - 1 + products.length) % products.length;
  const next = (index + 1) % products.length;

  const sheet = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opening = useRef<gsap.core.Timeline | null>(null);
  const opened = useRef(false);
  const closing = useRef(false);
  const switching = useRef<gsap.core.Animation | null>(null);
  const heading = useRef<1 | -1>(1);
  // The tool sliding out underneath while the next one wipes in.
  const [leaving, setLeaving] = useState<number | null>(null);

  const fullRect = () => {
    const m = window.innerWidth < 640 ? 0 : 14;
    return { left: m, top: m, width: window.innerWidth - m * 2, height: window.innerHeight - m * 2, rotation: 0 };
  };
  const fullRadius = () => (window.innerWidth < 640 ? 0 : 28);

  useLayoutEffect(() => {
    const el = sheet.current;
    const bodyEl = body.current;
    if (!el || !bodyEl) return;
    const reveal = bodyEl.querySelectorAll("[data-reveal], [data-slide='current'] [data-part]");
    // Slides only scroll once the sheet is full size; while it grows, their content would overflow
    // the small box and flash scrollbars.
    const scrollable = () => {
      bodyEl.dataset.scroll = "on";
      opened.current = true;
    };

    if (reducedMotion()) {
      gsap.set(el, { ...fullRect(), borderRadius: fullRadius() });
      gsap.set(face.current, { opacity: 0 });
      scrollable();
      const fade = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return () => {
        fade.kill();
      };
    }

    const tl = gsap
      .timeline()
      .fromTo(
        el,
        { ...getOrigin(index), borderRadius: 18 },
        { ...fullRect(), borderRadius: fullRadius(), duration: 1, ease: "expo.inOut" },
      )
      .to(face.current, { opacity: 0, duration: 0.4, ease: "power1.out" }, 0.5)
      .fromTo(
        reveal,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 },
        0.66,
      )
      .call(scrollable, [], 1);
    opening.current = tl;

    const onResize = () => gsap.set(el, { ...fullRect(), borderRadius: fullRadius() });
    window.addEventListener("resize", onResize);
    return () => {
      tl.kill();
      window.removeEventListener("resize", onResize);
    };
    // Runs once: the sheet opens from the card it was launched from.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (step: 1 | -1) => {
    if (!opened.current || closing.current || switching.current) return;
    heading.current = step;
    setLeaving(index);
    onIndex((index + step + products.length) % products.length);
  };

  // Moving between tools: wipe the new one in from the side we're heading towards, with the old one
  // drifting the other way underneath, then let the title's letters and the details follow in.
  useLayoutEffect(() => {
    const bodyEl = body.current;
    if (leaving === null || !bodyEl) return;
    const incoming = bodyEl.querySelector<HTMLElement>("[data-slide='current']");
    const outgoing = bodyEl.querySelector<HTMLElement>("[data-slide='leaving']");
    if (!incoming || !outgoing) return;
    const d = heading.current;
    const done = () => {
      switching.current = null;
      setLeaving(null);
    };

    if (reducedMotion()) {
      const fade = gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.25, onComplete: done });
      switching.current = fade;
      return () => {
        fade.kill();
      };
    }

    const tl = gsap
      .timeline({ onComplete: done })
      .fromTo(
        incoming,
        { clipPath: d > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "expo.inOut" },
        0,
      )
      .fromTo(
        incoming.querySelector("[data-slide-inner]"),
        { xPercent: 16 * d },
        { xPercent: 0, duration: 1.1, ease: "expo.inOut" },
        0,
      )
      .to(outgoing, { xPercent: -24 * d, duration: 1.1, ease: "expo.inOut" }, 0)
      .to(outgoing.querySelector("[data-slide-inner]"), { opacity: 0.2, duration: 1, ease: "power2.in" }, 0)
      .fromTo(
        incoming.querySelectorAll("[data-char]"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: { each: 0.03, from: d > 0 ? "start" : "end" } },
        0.45,
      )
      .fromTo(
        incoming.querySelectorAll("[data-part]:not(h3)"),
        { x: 70 * d, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.05 },
        0.5,
      )
      .fromTo(
        incoming.querySelector("[data-logo]"),
        { rotation: 16 * d, scale: 0.75, xPercent: 25 * d },
        { rotation: 0, scale: 1, xPercent: 0, duration: 1.3, ease: "expo.out" },
        0.35,
      );
    switching.current = tl;
    return () => {
      tl.kill();
    };
  }, [index, leaving]);

  // ← → keys move between tools while the sheet is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // A sideways swipe does the same on touch screens.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipe.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(t.clientY - start.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    opening.current?.kill();
    switching.current?.progress(1);
    if (reducedMotion()) {
      gsap.to(sheet.current, { opacity: 0, duration: 0.2, onComplete: onClosed });
      return;
    }
    // Shrink back into whichever tool is showing now (it may differ from the one that was opened).
    if (body.current) body.current.dataset.scroll = "off";
    gsap
      .timeline({ onComplete: onClosed })
      .to(body.current, { opacity: 0, duration: 0.25 }, 0)
      .to(face.current, { opacity: 1, duration: 0.3 }, 0.12)
      .to(sheet.current, { ...getOrigin(index), borderRadius: 18, duration: 0.9, ease: "expo.inOut" }, 0.08);
  };

  useModal(sheet, close, closeBtn, () => getCard(index));

  return createPortal(
    <div
      ref={sheet}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-sheet-title"
      tabIndex={-1}
      className="fixed z-[90] overflow-hidden border border-line bg-ink-2 shadow-[0_40px_140px_-20px_rgb(0_0_0/0.9)] outline-none"
    >
      <div ref={face} className="pointer-events-none absolute inset-0 [container-type:size]" aria-hidden>
        <CardFace product={p} sizes="480px" />
      </div>

      <div ref={body} data-scroll="off" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="group absolute inset-0">
        {leaving !== null && <ProductSlide key={products[leaving].slug} product={products[leaving]} current={false} />}
        <ProductSlide key={p.slug} product={p} current />

        <div
          data-reveal
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-b from-ink-2 from-70% to-transparent px-5 pb-6 pt-5 sm:px-10 sm:pt-8 lg:px-14"
        >
          <p className="text-sm text-muted">Built for {client.name}</p>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-ink-2/60 transition-colors hover:bg-white/5"
          >
            <FiX className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close {p.name}</span>
          </button>
        </div>

        <nav
          data-reveal
          aria-label="Other Swan tools"
          className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink-2 from-65% to-transparent px-5 pb-4 pt-8 sm:px-10 sm:pb-6 lg:px-14"
        >
          <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
            <button
              type="button"
              onClick={() => go(-1)}
              className="flex items-center gap-2 rounded-full py-2 pr-3 text-muted transition-colors hover:text-fg"
            >
              <FiArrowLeft aria-hidden /> {products[prev].name}
            </button>
            <p className="hidden text-xs text-muted [@media(pointer:fine)]:lg:block">Use ← → to switch</p>
            <button
              type="button"
              onClick={() => go(1)}
              className="flex items-center gap-2 rounded-full py-2 pl-3 text-muted transition-colors hover:text-fg"
            >
              {products[next].name} <FiArrowRight aria-hidden />
            </button>
          </div>
        </nav>
      </div>
    </div>,
    document.body,
  );
}
