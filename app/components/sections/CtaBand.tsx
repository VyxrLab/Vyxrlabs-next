import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { whatsappLink } from "@/lib/site";
import Magnetic from "../motion/Magnetic";
import RevealText from "../motion/RevealText";

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-line py-28 sm:py-40">
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{ background: "radial-gradient(60% 70% at 50% 110%, rgb(80 109 254 / 0.28), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-x relative">
        <RevealText className="display max-w-5xl text-[clamp(3rem,9vw,9rem)]">
          Let&apos;s build your <span className="accent">system.</span>
        </RevealText>
        <p className="mt-8 max-w-xl text-lg text-muted">
          Tell us how your business runs today. We&apos;ll show you how it could run tomorrow.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Magnetic>
            <Link href="/contact" className="btn-primary px-8 py-4 text-base">
              Start a project
            </Link>
          </Magnetic>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-ghost px-8 py-4 text-base">
            <FaWhatsapp aria-hidden /> WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
