import Image from "next/image";
import Link from "next/link";
import { founder } from "@/lib/site";
import ScrubText from "../motion/ScrubText";

export default function Statement() {
  return (
    <section className="container-x grid gap-10 py-28 sm:py-36 lg:grid-cols-12">
      <Link
        href="/#about"
        className="flex h-fit items-center gap-3 self-start lg:col-span-3 lg:mt-3"
        aria-label={`About ${founder.name}`}
      >
        <Image
          src={founder.photo}
          alt=""
          width={96}
          height={96}
          className="h-12 w-12 rounded-full object-cover object-top"
        />
        <span className="text-sm leading-tight">
          <span className="block">{founder.name}</span>
          <span className="text-muted">Founder</span>
        </span>
      </Link>
      <ScrubText
        className="display-tight text-[clamp(1.7rem,3.6vw,3.4rem)] lg:col-span-9"
        text="We turn the way your business runs into software. Products that close more sales, automations that give your team its hours back, and platforms that earn revenue on their own."
      />
    </section>
  );
}
