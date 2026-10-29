import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import type { Product } from "@/lib/site";
import ProductVisual from "../sections/ProductVisual";

/**
 * One Swan tool's page inside the product sheet. While the sheet moves between tools it stacks two of
 * these: the one leaving underneath and the one arriving on top.
 *
 * The data-* hooks are what the sheet animates: `data-slide-inner` drifts for parallax, `data-char`
 * letters rise into the title, `data-part` blocks slide in, and `data-logo` swings into place.
 */
export default function ProductSlide({ product: p, current }: { product: Product; current: boolean }) {
  return (
    <section
      data-slide={current ? "current" : "leaving"}
      data-lenis-prevent
      aria-hidden={!current}
      inert={!current}
      className="scroll-thin absolute inset-0 overflow-hidden overscroll-contain bg-ink-2 group-data-[scroll=on]:overflow-y-auto"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(45% 55% at 76% 48%, ${p.color}2e, transparent 72%)` }}
        aria-hidden
      />

      <div data-slide-inner className="relative flex min-h-full items-center px-5 pb-28 pt-24 sm:px-10 lg:px-14">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <h3
              id={current ? "product-sheet-title" : undefined}
              data-part
              aria-label={p.name}
              className="display-tight overflow-hidden pb-[0.08em] text-[clamp(2.4rem,5.4vw,5rem)]"
            >
              <span aria-hidden>
                {[...p.name].map((ch, i) => (
                  <span key={i} data-char className="inline-block">
                    {ch === " " ? " " : ch}
                  </span>
                ))}
              </span>
            </h3>
            <p data-part className="mt-5 text-xl sm:text-2xl">
              {p.tagline}
            </p>
            <p data-part className="mt-4 max-w-xl leading-relaxed text-muted sm:text-lg">
              {p.description}
            </p>
            <dl data-part className="mt-7 grid max-w-xl grid-cols-2 border-y border-line">
              <div className="py-4 pr-5">
                <dt className="text-xs text-muted">Before</dt>
                {/* Struck through when it's a cost that went away. */}
                <dd className={`mt-1.5 text-muted decoration-1 ${p.tag.before ? "line-through" : ""}`}>
                  {p.impact.before}
                </dd>
              </div>
              <div className="border-l border-line py-4 pl-5">
                <dt className="text-xs text-muted">Now, for Black Swan</dt>
                <dd className="mt-1.5 text-lg font-medium" style={{ color: p.color }}>
                  {p.impact.after}
                </dd>
              </div>
            </dl>
            <ul data-part className="mt-7 space-y-2.5">
              {p.facts.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <FiCheck className="shrink-0" style={{ color: p.color }} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <div data-part className="mt-9 flex flex-wrap gap-3">
              <Link href={`/contact?need=${p.need}`} className="btn-primary">
                Build something like this
              </Link>
              {p.href && (
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  Visit {new URL(p.href).hostname} <FiArrowUpRight aria-hidden />
                </a>
              )}
            </div>
          </div>

          <div data-part className="relative mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none">
            <div data-logo className="relative ml-auto w-[58%] max-w-[320px] lg:mr-6">
              <Image
                src={p.logo}
                alt={`${p.name} logo`}
                width={480}
                height={480}
                sizes="(min-width: 1024px) 320px, 58vw"
                className="h-auto w-full drop-shadow-[0_30px_60px_rgb(0_0_0/0.6)]"
              />
            </div>
            <div className="relative -mt-[18%] max-w-sm">
              <ProductVisual slug={p.slug} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
