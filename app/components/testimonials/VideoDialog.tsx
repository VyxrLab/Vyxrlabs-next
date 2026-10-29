"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import type { Testimonial } from "@/lib/site";
import { gsap } from "@/lib/gsap";
import { useModal } from "../ui/useModal";

type Props = {
  testimonial: Testimonial;
  /** The round video bubble this player grows out of and shrinks back into. */
  getOrigin: () => DOMRect | undefined;
  /** The bubble to focus again on close. */
  getBubble: () => HTMLElement | null | undefined;
  onClosed: () => void;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function VideoDialog({ testimonial: t, getOrigin, getBubble, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opening = useRef<gsap.core.Timeline | null>(null);
  const closing = useRef(false);

  // The largest box of the video's shape that fits, leaving room for the caption and close button.
  const fitRect = () => {
    const maxW = Math.min(window.innerWidth - 32, 1100);
    const maxH = window.innerHeight - 170;
    let width = maxW;
    let height = width / t.aspect;
    if (height > maxH) {
      height = maxH;
      width = height * t.aspect;
    }
    return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2 - 20, width, height };
  };

  useLayoutEffect(() => {
    const target = fitRect();
    const origin = getOrigin();
    const tl = gsap.timeline();
    tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0);
    if (reducedMotion() || !origin) {
      tl.fromTo(frame.current, { ...target, borderRadius: 20, opacity: 0 }, { opacity: 1, duration: 0.25 }, 0);
    } else {
      tl.fromTo(
        frame.current,
        { left: origin.left, top: origin.top, width: origin.width, height: origin.height, borderRadius: origin.width / 2 },
        { ...target, borderRadius: 20, duration: 0.9, ease: "expo.inOut" },
        0,
      );
    }
    tl.fromTo(caption.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.55);
    opening.current = tl;

    const onResize = () => gsap.set(frame.current, fitRect());
    window.addEventListener("resize", onResize);
    return () => {
      tl.kill();
      window.removeEventListener("resize", onResize);
    };
    // Runs once: the player opens from the bubble that was pressed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    opening.current?.kill();
    video.current?.pause();
    const origin = getOrigin();
    const tl = gsap.timeline({ onComplete: onClosed });
    tl.to(caption.current, { opacity: 0, duration: 0.2 }, 0).to(backdrop.current, { opacity: 0, duration: 0.5 }, 0.2);
    if (reducedMotion() || !origin) {
      tl.to(frame.current, { opacity: 0, duration: 0.2 }, 0);
    } else {
      tl.to(
        frame.current,
        {
          left: origin.left,
          top: origin.top,
          width: origin.width,
          height: origin.height,
          borderRadius: origin.width / 2,
          duration: 0.8,
          ease: "expo.inOut",
        },
        0,
      );
    }
  };

  useModal(root, close, closeBtn, getBubble);

  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={`Video from ${t.name}, ${t.company}`} className="fixed inset-0 z-[90]">
      <div ref={backdrop} onClick={close} className="absolute inset-0 bg-ink/90 backdrop-blur-md" aria-hidden />
      <div ref={frame} className="absolute overflow-hidden bg-black shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9)]">
        <video
          ref={video}
          src={t.video}
          poster={t.poster}
          autoPlay
          controls
          playsInline
          className={`h-full w-full ${t.fit === "cover" ? "object-cover" : "object-contain"}`}
        />
      </div>
      <p ref={caption} className="pointer-events-none absolute inset-x-0 bottom-6 px-20 text-center text-sm">
        {t.name}
        <span className="text-muted">, {t.company}</span>
      </p>
      <button
        ref={closeBtn}
        type="button"
        onClick={close}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-line bg-ink/60 transition-colors hover:bg-white/10 sm:right-6 sm:top-6"
      >
        <FiX className="h-5 w-5" aria-hidden />
        <span className="sr-only">Close video</span>
      </button>
    </div>,
    document.body,
  );
}
