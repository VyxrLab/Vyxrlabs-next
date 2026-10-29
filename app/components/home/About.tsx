"use client";

import { useRef } from "react";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { contact, founder, whatsappLink } from "@/lib/site";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import RevealText from "../motion/RevealText";
import RollingNumber from "../motion/RollingNumber";

export default function About() {
  const root = useRef<HTMLElement>(null);

  // The photo unmasks upward while the picture inside settles from a slight zoom.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrollTrigger = { trigger: "[data-about-frame]", start: "top 85%", once: true };
        gsap.from("[data-about-frame]", {
          clipPath: "inset(100% 0% 0% 0% round 22px)",
          duration: 1.4,
          ease: "expo.inOut",
          scrollTrigger,
        });
        gsap.from("[data-about-photo]", { scale: 1.35, duration: 1.8, ease: "expo.out", scrollTrigger });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" aria-labelledby="about-heading" className="py-28 sm:py-40">
      <div className="container-x">
        <div className="grid gap-10 md:grid-cols-12">
          <figure className="md:col-span-4 lg:col-span-3">
            <div
              data-about-frame
              className="relative aspect-[4/5] w-[200px] overflow-hidden rounded-[22px] border border-line [clip-path:inset(0%_0%_0%_0%_round_22px)] sm:w-[240px] md:w-full md:max-w-[280px]"
            >
              <div data-about-photo className="absolute inset-0">
                <Image
                  src={founder.photo}
                  alt={`${founder.name}, founder of VyxrLabs`}
                  fill
                  sizes="(min-width: 768px) 300px, 240px"
                  className="object-cover object-[50%_30%]"
                />
              </div>
            </div>
          </figure>

          <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
            <RevealText id="about-heading" className="display-tight text-[clamp(2.4rem,5vw,4.5rem)]">
              {founder.name}
            </RevealText>
            <p className="mt-3 text-muted">{founder.role}</p>
            <p className="mt-10 max-w-3xl text-[clamp(1.35rem,2.2vw,2rem)] leading-snug">{founder.bio[0]}</p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{founder.bio[1]}</p>

            <dl className="mt-12 grid border-t border-line sm:grid-cols-3">
              {founder.facts.map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col-reverse gap-3 border-b border-line py-6 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
                >
                  <dt className="text-sm text-muted">{f.label}</dt>
                  <dd className="display-tight text-[clamp(2.6rem,4.2vw,3.8rem)]">
                    <RollingNumber value={f.value} prefix={f.prefix} suffix={f.suffix} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={whatsappLink("Hi Mansoor, I'd like to talk about a project.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <FaWhatsapp aria-hidden /> Message Mansoor
              </a>
              <a href={`mailto:${contact.email}`} className="btn-ghost">
                <FiMail aria-hidden /> {contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
