import Image from "next/image";
import Link from "next/link";
import { contact, navItems, products, whatsappLink } from "@/lib/site";
import BackToTop from "./BackToTop";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-ink-2">
      <div className="container-x grid gap-12 pb-10 pt-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display-tight max-w-sm text-3xl sm:text-4xl">
            Your partner <span className="accent">forever.</span>
          </p>
          <p className="mt-4 max-w-sm text-muted">
            Custom products, automation, SaaS and AI for businesses that want their systems to do more of
            the work.
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="eyebrow mb-4">Pages</p>
          <ul className="md:space-y-2">
            {[{ name: "Home", href: "/" }, ...navItems].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-block py-1.5 text-fg/80 transition-colors hover:text-signal-hi md:py-0">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Built for Black Swan</p>
          <ul className="md:space-y-2">
            {products.map((p) => (
              <li key={p.slug}>
                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-1.5 text-fg/80 transition-colors hover:text-signal-hi md:py-0"
                  >
                    {p.name}
                  </a>
                ) : (
                  <Link href="/#work" className="inline-block py-1.5 text-fg/80 transition-colors hover:text-signal-hi md:py-0">
                    {p.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <address className="not-italic md:col-span-3">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="md:space-y-2">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1.5 text-fg/80 transition-colors hover:text-signal-hi md:py-0"
              >
                WhatsApp {contact.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="inline-block py-1.5 text-fg/80 transition-colors hover:text-signal-hi md:py-0">
                {contact.email}
              </a>
            </li>
            <li className="pt-1.5 text-muted md:pt-0">{contact.office}</li>
          </ul>
        </address>
      </div>

      <div className="container-x">
        <Image
          src="/logo.png"
          alt=""
          width={6000}
          height={1569}
          sizes="(min-width: 1400px) 1320px, 92vw"
          className="w-full opacity-[0.07] select-none"
          aria-hidden
        />
      </div>

      <div className="container-x flex flex-col items-start justify-between gap-4 border-t border-line py-6 pb-24 text-sm text-muted sm:flex-row sm:items-center sm:pb-6 sm:pr-24">
        <p>© {year} VyxrLabs. All rights reserved.</p>
        <BackToTop />
      </div>
    </footer>
  );
}
