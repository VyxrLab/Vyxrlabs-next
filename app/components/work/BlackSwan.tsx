"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { client, products } from "@/lib/site";
import { ScrollTrigger } from "@/lib/gsap";
import CardFace from "./CardFace";
import ProductSheet, { type CardRect } from "./ProductSheet";

const STEP = 360 / products.length;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

/** First-paint position (the open ring) in viewport units, so the server render needs no measuring. */
const restingTransform = (i: number) => {
  const rad = (i * STEP * Math.PI) / 180;
  return `translate3d(${(Math.sin(rad) * 27).toFixed(2)}vw, ${(-Math.cos(rad) * 30).toFixed(2)}svh, 0) rotate(${i * STEP}deg)`;
};

type Pose = { x: number; y: number; angle: number; scale: number };

/**
 * The four Swan tools orbit the client's name. Scrolling in, they fly out of a stack into a ring
 * that keeps turning; pointing at one slows the ring, and selecting one unfolds it into a full sheet.
 */
export default function BlackSwan() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const poses = useRef<Pose[]>(products.map(() => ({ x: 0, y: 0, angle: 0, scale: 1 })));
  const progress = useRef(0);
  const hovered = useRef<number | null>(null);
  const paused = useRef(false);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (self) => (progress.current = self.progress),
    });
    progress.current = st.progress;
    return () => st.kill();
  }, []);

  // One loop places every card from two numbers: how far the ring has opened, and how far it has turned.
  useEffect(() => {
    const stageEl = stage.current;
    if (!stageEl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lift = products.map(() => 0);
    let w = 0;
    let h = 0;
    let spin = 0;
    let speed = 7;

    const place = (dt: number, t: number) => {
      const p = progress.current;
      // Cards fly out while the stage rises into view, and are fully open as it pins.
      const spread = reduced ? 1 : smooth(clamp01((p - 0.16) / 0.38));
      const narrow = w < 640;
      const rx = narrow ? w * 0.37 : Math.min(w * 0.29, 400);
      const ry = Math.min(h * (narrow ? 0.3 : 0.31), 290);

      if (!paused.current && !reduced) {
        speed += ((hovered.current === null ? 7 : 0.5) - speed) * Math.min(1, dt * 4);
        spin += speed * dt;
      }
      const turn = reduced ? 0 : spin + p * 90;

      for (let i = 0; i < products.length; i++) {
        const el = cards.current[i];
        if (!el) continue;
        lift[i] += ((hovered.current === i ? 1 : 0) - lift[i]) * Math.min(1, dt * 8);
        const angle = turn + i * STEP;
        const rad = (angle * Math.PI) / 180;
        const reach = 0.05 + 0.95 * spread;
        const x = Math.sin(rad) * rx * reach;
        const y = -Math.cos(rad) * ry * reach;
        const z = (1 - spread) * -45 * i + lift[i] * 70;
        const tilt = (1 - spread) * 55;
        const sway = reduced ? 0 : Math.sin(t * 0.7 + i * 1.9) * 9 * spread;
        const scale = (0.7 + 0.3 * spread) * (1 + 0.06 * lift[i]);
        el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotate(${angle}deg) rotateX(${tilt}deg) rotateY(${sway}deg) scale(${scale})`;
        poses.current[i] = { x, y, angle, scale };
      }

      const shown = clamp01((spread - 0.25) / 0.75);
      if (title.current) {
        title.current.style.opacity = String(shown);
        title.current.style.filter = shown < 1 ? `blur(${(1 - shown) * 18}px)` : "none";
      }
      if (hint.current) hint.current.style.opacity = String(clamp01((spread - 0.6) / 0.4));
    };

    const measure = () => {
      w = stageEl.clientWidth;
      h = stageEl.clientHeight;
      place(0, performance.now() / 1000);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stageEl);
    if (reduced) return () => ro.disconnect();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(stageEl);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible && !document.hidden) place(dt, now / 1000);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const getOrigin = useCallback((i: number): CardRect => {
    const box = stage.current?.getBoundingClientRect();
    const el = cards.current[i];
    const pose = poses.current[i];
    if (!box || !el) return { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0, rotation: 0 };
    const width = el.offsetWidth * pose.scale;
    const height = el.offsetHeight * pose.scale;
    return {
      left: box.left + box.width / 2 + pose.x - width / 2,
      top: box.top + box.height / 2 + pose.y - height / 2,
      width,
      height,
      // Unwind the short way round.
      rotation: ((((pose.angle + 180) % 360) + 360) % 360) - 180,
    };
  }, []);

  const open = (i: number) => {
    paused.current = true;
    hovered.current = null;
    setActive(i);
  };
  const closed = useCallback(() => {
    setActive(null);
    paused.current = false;
  }, []);

  return (
    <section ref={root} id="work" aria-labelledby="work-heading" className="relative h-[180vh] motion-reduce:h-auto">
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden [perspective:1100px] motion-reduce:relative">
        <div ref={title} className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <h2 id="work-heading" className="display-tight text-[clamp(1.9rem,4.6vw,4.4rem)]">
              Black Swan
              <br />
              Refunds
            </h2>
            <p className="mx-auto mt-4 max-w-[11.5rem] text-sm text-muted sm:max-w-none sm:text-base">
              {client.result} with the tools we built for them
            </p>
          </div>
        </div>

        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {products.map((p, i) => (
            <button
              key={p.slug}
              ref={(el) => {
                cards.current[i] = el;
              }}
              type="button"
              aria-haspopup="dialog"
              aria-label={`Open ${p.name}. Before: ${p.impact.before}. Now: ${p.impact.after}.`}
              onClick={() => open(i)}
              onPointerEnter={() => (hovered.current = i)}
              onPointerLeave={() => (hovered.current = null)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && (hovered.current = i)}
              onBlur={() => (hovered.current = null)}
              style={{ transform: restingTransform(i) }}
              className={`absolute left-1/2 top-1/2 -ml-[62px] -mt-[40px] h-[80px] w-[124px] rounded-[14px] border border-white/10 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.9)] [container-type:size] will-change-transform sm:-ml-[100px] sm:-mt-[64px] sm:h-[128px] sm:w-[200px] lg:-ml-[125px] lg:-mt-[80px] lg:h-[160px] lg:w-[250px] lg:rounded-[18px] ${
                active === i ? "invisible" : ""
              }`}
            >
              <CardFace product={p} sizes="(min-width: 1024px) 200px, 120px" />
            </button>
          ))}
        </div>

        <p ref={hint} className="absolute inset-x-0 bottom-8 px-20 text-center text-sm text-muted sm:bottom-10">
          Select a tool to see what it does.
        </p>
      </div>

      {active !== null && (
        <ProductSheet
          index={active}
          onIndex={setActive}
          getOrigin={getOrigin}
          getCard={(i) => cards.current[i]}
          onClosed={closed}
        />
      )}
    </section>
  );
}
