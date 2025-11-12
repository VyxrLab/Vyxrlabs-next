"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BsArrowRight, BsChevronDown, BsChevronUp } from "react-icons/bs"
import { FiMenu, FiX } from "react-icons/fi"

// Define the type for a single navigation item
interface NavItem {
  name: string
  path: string
  dropdown?: { name: string; path: string }[]
  icon?: string
  iconHover?: string
  onlyIcon?: boolean
}

export default function Header() {
  const navItems: NavItem[] = [
    {
      name: "Services",
      path: "/Service",
      dropdown: [
        { name: "Web Design & Development", path: "/service/web" },
        { name: "Business Automation", path: "/service/ba" },
        { name: "Search Engine Optimization", path: "/service/seo" },
        { name: "Conversion Optimization", path: "/service/co" },
      ],
    },
    { name: "About Us", path: "/abouts" },
    {
      name: "Home",
      path: "/",
      icon: "/vercel.svg",
      iconHover: "/logoo.png",
      onlyIcon: true,
    },
    { name: "Contact Us", path: "/contacts" },
    { name: "Careers", path: "/careers" },
  ]

  const pathname = usePathname()
  // Use a type union for string | null
  const [openDropdown, setOpenDropdown] = useState<string | null>(null) 
  const [hoveredHome, setHoveredHome] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Corrected type for mobileDropdownOpen
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  // Corrected type for the timeout ref
  const timeoutRef = useRef<NodeJS.Timeout | number | null>(null)

  // Handle outside click for desktop dropdown close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle desktop dropdown hover
  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpenDropdown(name)
  }
  const handleMouseLeave = () => {
    // Cast to NodeJS.Timeout or use type guard if type is number for browser timers
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 180) as unknown as NodeJS.Timeout
  }
  
  // Close mobile menu on link click (optional optimization: combine with setMobileMenuOpen)
  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
    // Also close any open mobile dropdown when navigating
    setMobileDropdownOpen(null); 
  }

  return (
    <nav className="flex justify-end md:justify-center">
      <div className="fixed top-3 z-[1000] max-w-4xl">
        {/* ---------- Desktop Navbar ---------- */}
        {/* Note: Ensure 'cblue' is defined in your Tailwind config */}
        <div className="hidden md:flex p-[2px] opacity-95 bg-gradient-to-br from-green-200 via-slate-800 to-pink-300 rounded-xl">
          <div className="flex items-center justify-between gap-8 px-4 py-2 font-inter bg-gradient-to-r from-slate-700 via-black to-blue-950 rounded-xl">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative group"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
                onMouseLeave={() => item.dropdown && handleMouseLeave()}
                // Only assign ref if it's a dropdown, as originally intended
                ref={item.dropdown ? dropdownRef : null} 
              >
                <Link href={item.path} className="flex items-center px-2 transition-all">
                  {item.onlyIcon ? (
                    // Type guard ensures item.icon and item.iconHover are available
                    item.icon && (
                        <Image
                          src={hoveredHome || pathname === item.path ? item.iconHover || item.icon : item.icon}
                          alt={item.name}
                          width={30}
                          height={30}
                          className="transition-transform hover:scale-110"
                          onMouseEnter={() => item.name === "Home" && setHoveredHome(true)}
                          onMouseLeave={() => item.name === "Home" && setHoveredHome(false)}
                        />
                      )
                  ) : (
                    <span
                      className={`flex items-center gap-1 transition-colors ${
                        pathname === item.path
                          ? "text-cblue"
                          : "text-white group-hover:text-cblue"
                      }`}
                    >
                      {item.name}
                      {item.dropdown && (
                        <BsChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            openDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </span>
                  )}
                </Link>

                {/* ---------- Desktop Dropdown ---------- */}
                {item.dropdown && openDropdown === item.name && (
                  <div
                    className="absolute left-0 top-full mt-4 bg-black/95 backdrop-blur-sm text-white rounded-lg border border-gray-700 min-w-[260px] shadow-xl z-50 animate-in slide-in-from-top-2 duration-150"
                    // Clear the hide timeout when moving back onto the dropdown
                    onMouseEnter={() => timeoutRef.current && clearTimeout(timeoutRef.current)} 
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Styling optimization: use utility classes for the triangle */}
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-black border-t border-l border-gray-700 rotate-45"></div>
                    <div className="py-2">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          className="block px-4 py-3 text-sm border-b border-gray-600 last:border-b-0 hover:text-cblue transition-all"
                          onClick={() => setOpenDropdown(null)} // Close dropdown on click
                        >
                          <span className="flex justify-between items-center font-medium">
                            {sub.name}
                            <BsArrowRight />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Mobile Hamburger ---------- */}
        <div className="md:hidden px-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-[2px] bg-gradient-to-br from-green-200 via-slate-800 to-pink-300 rounded-lg"
          >
            <div className="bg-gradient-to-r from-slate-700 via-black to-blue-950 rounded-lg p-2">
              <FiMenu className="text-white w-6 h-6" />
            </div>
          </button>
        </div>
      </div>

      {/* ---------- Mobile Sidebar ---------- */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] transform transition-all duration-300 ${
          mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none" // Optimization: Prevent interaction when hidden
        }`}
        onClick={() => setMobileMenuOpen(false)} // Close sidebar when clicking the overlay
      >
        {/* Prevent click on sidebar from closing the menu */}
        <div className="absolute right-0 top-0 h-full w-full bg-gradient-to-b from-slate-900 to-black text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <span className="text-xl text-cblue/70 font-semibold">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <FiX className="w-6 h-6 hover:text-cblue" />
            </button>
          </div>

          <div className="flex flex-col p-4 space-y-6 font-inter text-lg overflow-y-auto max-h-[calc(100vh-60px)]">
            {navItems.map((item) => (
              <div key={item.path} className="border-b border-gray-600/50 pb-2">
                {item.dropdown ? (
                  <div>
                    <button
                      // The error was here: need to toggle the name string or null
                      onClick={() =>
                        setMobileDropdownOpen((prev) => 
                          prev === item.name ? null : item.name
                        )
                      }
                      className="w-full flex justify-between items-center py-2 px-2 rounded hover:text-cblue transition"
                    >
                      {/* Separate Link from the button to make the toggle area larger */}
                      <Link href={item.path} onClick={handleMobileLinkClick}>
                        {item.name}
                      </Link>
                      {mobileDropdownOpen === item.name ? (
                        <BsChevronUp className="w-4 h-4" />
                      ) : (
                        <BsChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      // Using a dynamic height calculation for better transition:
                      // 'max-h-0' is good, but if content grows, 'max-h-screen' is a safe utility class
                      className={`overflow-hidden transition-all duration-300 pl-4 border-l border-cblue/30 ${
                        mobileDropdownOpen === item.name ? "max-h-80" : "max-h-0"
                      }`}
                    >
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={handleMobileLinkClick} // Use combined handler
                          className="block py-3 text-sm hover:border-b hover:bg-cblue transition-all"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    onClick={handleMobileLinkClick} // Use combined handler
                    className={`block py-2 px-2 rounded hover:text-cblue transition ${
                      pathname === item.path ? "text-cblue" : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}