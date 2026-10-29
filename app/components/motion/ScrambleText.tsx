"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "abcdefghijklmnopqrstuvwxyz/<>_";

/** Text that scrambles and resolves left-to-right when `active` flips on. */
export default function ScrambleText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const frame = useRef<number>(0);

  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const total = text.length * 2;
    const step = () => {
      i++;
      setDisplay(
        text
          .split("")
          .map((ch, idx) => {
            if (ch === " " || idx < i / 2) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (i < total) frame.current = requestAnimationFrame(step);
      else setDisplay(text);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame.current);
      setDisplay(text);
    };
  }, [active, text]);

  // The invisible copy reserves the final width so the scramble never makes the layout jump.
  return (
    <span className="inline-grid">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span aria-hidden className="col-start-1 row-start-1 whitespace-nowrap">
        {display}
      </span>
    </span>
  );
}
