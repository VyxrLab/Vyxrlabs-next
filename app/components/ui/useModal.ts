"use client";

import { useEffect, useRef, type RefObject } from "react";
import { getLenis } from "../motion/SmoothScroll";

/**
 * Plumbing shared by the full-screen dialogs (product sheet, video player).
 * While open: smooth scroll pauses, the rest of the page is inert, Escape closes,
 * and focus returns to whatever opened the dialog afterwards.
 *
 * `root` must be the dialog's top-level element, rendered straight into <body>.
 * `returnFocus` names the element to focus on close (the opener is often hidden while the dialog is up).
 */
export function useModal(
  root: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
  returnFocus?: () => HTMLElement | null | undefined,
) {
  const close = useRef(onClose);
  const giveBack = useRef(returnFocus);
  useEffect(() => {
    close.current = onClose;
    giveBack.current = returnFocus;
  });

  useEffect(() => {
    const dialog = root.current;
    if (!dialog) return;
    const opener = document.activeElement as HTMLElement | null;
    const others = [...document.body.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== dialog && !el.inert,
    );
    others.forEach((el) => (el.inert = true));
    getLenis()?.stop();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    (initialFocus?.current ?? dialog).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      others.forEach((el) => (el.inert = false));
      html.style.overflow = overflow;
      getLenis()?.start();
      (giveBack.current?.() ?? opener)?.focus({ preventScroll: true });
    };
  }, [root, initialFocus]);
}
