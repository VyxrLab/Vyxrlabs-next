"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

type Props = { value: number; prefix?: string; suffix?: string };

// Each digit column holds 0–9 twice, so it can spin a full turn before landing.
const REEL = [...Array(20).keys()].map((n) => n % 10);

/** A number whose digits roll up into place like an odometer the first time it scrolls into view. */
export default function RollingNumber({ value, prefix = "", suffix = "" }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const digits = String(value).split("").map(Number);
  // Where each reel stops: the second pass of its digit.
  const stop = (d: number) => `translateY(-${(10 + d) * 5}%)`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          "[data-reel]",
          // y: 0 stops GSAP reading the server-rendered resting offset in as pixels.
          { y: 0, yPercent: 0 },
          {
            yPercent: (i) => -(10 + digits[i]) * 5,
            duration: 1.6,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: { trigger: root.current, start: "top 90%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <span ref={root} className="inline-block">
      <span className="sr-only">
        {prefix}
        {value}
        {suffix}
      </span>
      {/* Every piece is a 1em box, so the reels, prefix and suffix line up exactly. */}
      <span aria-hidden className="inline-flex items-end leading-none">
        {prefix && <span className="block h-[1em]">{prefix}</span>}
        {digits.map((d, i) => (
          <span key={i} className="block h-[1em] overflow-hidden">
            <span data-reel className="flex flex-col" style={{ transform: stop(d) }}>
              {REEL.map((n, j) => (
                <span key={j} className="block h-[1em]">
                  {n}
                </span>
              ))}
            </span>
          </span>
        ))}
        {suffix && <span className="block h-[1em]">{suffix}</span>}
      </span>
    </span>
  );
}
