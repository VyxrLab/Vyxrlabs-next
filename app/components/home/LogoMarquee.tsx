import Image from "next/image";
import { clientLogos } from "@/lib/site";

export default function LogoMarquee() {
  return (
    <section aria-labelledby="clients-heading" className="relative border-y border-line py-10">
      <h2 id="clients-heading" className="eyebrow container-x mb-6">
        {"// Businesses we've built for"}
      </h2>
      <div
        className="group flex overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 animate-marquee items-center gap-16 pr-16 group-hover:[animation-play-state:paused]"
          >
            {clientLogos.map((src, i) => (
              <li key={src} className="shrink-0">
                <Image
                  src={src}
                  alt={copy === 0 ? `Client logo ${i + 1}` : ""}
                  width={160}
                  height={64}
                  className="h-10 w-auto object-contain opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
