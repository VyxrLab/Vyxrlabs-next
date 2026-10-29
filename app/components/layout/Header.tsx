"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";
import { contact, navItems, whatsappLink } from "@/lib/site";
import ScrambleText from "../motion/ScrambleText";
import { getLenis } from "../motion/SmoothScroll";

export default function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  // Hide while scrolling down, reveal on scroll up.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 240);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Freeze the page behind the mobile menu; close it with Escape.
  useEffect(() => {
    const lenis = getLenis();
    if (menuOpen) {
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.documentElement.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // The page transition does the moving; the menu just gets out of the way behind it.
  const closeMenu = () => setMenuOpen(false);

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-expo ${
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="container-x pt-3 sm:pt-4">
          <nav
            aria-label="Main"
            className={`flex items-center justify-between gap-4 rounded-full border px-4 py-2.5 transition-colors duration-500 sm:px-5 ${
              scrolled || menuOpen
                ? "border-line bg-ink/70 backdrop-blur-xl"
                : "border-transparent bg-transparent"
            }`}
          >
            <Link href="/" onClick={closeMenu} className="-my-2 block shrink-0 py-2" aria-label="VyxrLabs home">
              <Image src="/logo.png" alt="VyxrLabs" width={600} height={157} className="h-5 w-auto sm:h-6" preload />
            </Link>

            <ul className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                      isActive(item.href) ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    <ScrambleText text={item.name} active={hovered === item.href} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Link href="/contact" className="btn-primary hidden px-5 py-2.5 md:inline-flex">
                Let&apos;s talk
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
              >
                {menuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        data-lenis-prevent
        inert={!menuOpen}
        className={`fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-xl transition-opacity duration-500 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="container-x mt-28 flex flex-col gap-2">
          {[{ name: "Home", href: "/#top" }, ...navItems].map((item, i) => (
            <li
              key={item.href}
              className="overflow-hidden"
              style={{ transitionDelay: menuOpen ? `${120 + i * 60}ms` : "0ms" }}
            >
              <Link
                href={item.href}
                onClick={closeMenu}
                className={`display block py-1 text-5xl transition-transform duration-700 ease-out-expo ${
                  menuOpen ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ transitionDelay: menuOpen ? `${120 + i * 60}ms` : "0ms" }}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {/* Bottom padding keeps the contact details clear of the floating WhatsApp button. */}
        <div className="container-x mt-auto pb-24 text-sm text-muted">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="block py-2 hover:text-fg">
            WhatsApp {contact.whatsappDisplay}
          </a>
          <a href={`mailto:${contact.email}`} className="block py-2 hover:text-fg">
            {contact.email}
          </a>
          <p className="pt-2">{contact.office}</p>
        </div>
      </div>
    </>
  );
}
