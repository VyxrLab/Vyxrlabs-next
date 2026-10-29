"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { testimonials } from "@/lib/site";
import RevealText from "../motion/RevealText";
import VideoDialog from "./VideoDialog";

/** Client videos as round "video message" bubbles; each one opens into a full player. */
export default function Testimonials() {
  const [playing, setPlaying] = useState<number | null>(null);
  const bubbles = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <section id="testimonials" aria-labelledby="testimonials-heading" className="container-x py-28 sm:py-36">
      <RevealText id="testimonials-heading" className="display-tight mb-12 max-w-3xl text-[clamp(2rem,4.4vw,4rem)] sm:mb-16">
        In their own words.
      </RevealText>

      <ul className="border-t border-line">
        {testimonials.map((t, i) => (
          <li
            key={t.name}
            className="grid gap-8 border-b border-line py-10 sm:py-14 md:grid-cols-12 md:items-center md:gap-10"
          >
            <div className="md:col-span-4 lg:col-span-3">
              <button
                ref={(el) => {
                  bubbles.current[i] = el;
                }}
                type="button"
                aria-haspopup="dialog"
                onClick={() => setPlaying(i)}
                className={`group relative block aspect-square w-40 rounded-full sm:w-52 lg:w-60 ${
                  playing === i ? "invisible" : ""
                }`}
              >
                <span className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-white/15">
                  <Image
                    src={t.poster}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 240px, (min-width: 640px) 208px, 160px"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                </span>
                <span className="absolute bottom-[4%] right-[4%] grid h-12 w-12 place-items-center rounded-full bg-fg text-ink shadow-[0_10px_30px_-6px_rgb(0_0_0/0.7)] transition-transform duration-500 ease-out-expo group-hover:scale-110 lg:h-14 lg:w-14">
                  <FaPlay className="ml-0.5 h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="sr-only">
                  Play the video from {t.name}, {t.company}
                </span>
              </button>
            </div>

            <figure className="md:col-span-8 lg:col-span-9">
              <p aria-hidden className="display-tight max-w-4xl text-[clamp(1.6rem,3.2vw,3rem)]">
                &ldquo;{t.pull}&rdquo;
              </p>
              <blockquote className="mt-5 max-w-2xl leading-relaxed text-muted">
                <p>{t.quote}</p>
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <span className="font-medium">{t.name}</span>
                <span className="text-muted">, {t.company}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {playing !== null && (
        <VideoDialog
          testimonial={testimonials[playing]}
          getOrigin={() => bubbles.current[playing]?.getBoundingClientRect()}
          getBubble={() => bubbles.current[playing]}
          onClosed={() => setPlaying(null)}
        />
      )}
    </section>
  );
}
