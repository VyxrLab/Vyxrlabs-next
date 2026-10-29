import Image from "next/image";
import type { Product } from "@/lib/site";

/**
 * The face of a Swan tool card: its logo lit by its own brand colour, its name, and what it cut from
 * Black Swan's costs. Fills its (rounded) parent; text sizes follow the card's height.
 */
export default function CardFace({ product: p, sizes }: { product: Product; sizes: string }) {
  return (
    <span className="absolute inset-0 overflow-hidden rounded-[inherit] bg-[#060912]">
      <span
        className="absolute inset-0"
        style={{ background: `radial-gradient(52% 62% at 50% 48%, ${p.color}47, transparent 72%)` }}
        aria-hidden
      />
      <Image
        src={p.logo}
        alt=""
        width={480}
        height={480}
        sizes={sizes}
        className="absolute left-1/2 top-[50%] h-[50%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_10px_24px_rgb(0_0_0/0.55)]"
      />
      <span className="absolute left-[6%] top-[8%] text-[clamp(9px,8cqh,15px)] font-medium tracking-[-0.01em]">
        {p.name}
      </span>
      <span className="absolute bottom-[8%] left-[6%] flex items-baseline gap-[0.4em] text-[clamp(9px,8cqh,14px)]">
        {p.tag.before && (
          <>
            <s className="text-fg/60 decoration-1">{p.tag.before}</s>
            <span className="text-fg/60" aria-hidden>
              →
            </span>
          </>
        )}
        <span className="font-semibold" style={{ color: p.color }}>
          {p.tag.after}
        </span>
      </span>
    </span>
  );
}
