"use client";

import { FiArrowUp } from "react-icons/fi";
import { transitionTo } from "../motion/PageTransition";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => transitionTo(window.location.pathname)}
      className="-my-2 inline-flex items-center gap-2 py-2 transition-colors hover:text-fg"
    >
      Back to top <FiArrowUp aria-hidden />
    </button>
  );
}
