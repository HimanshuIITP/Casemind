"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Product", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Features", href: "#" },
  { label: "Resources", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Developers", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none"
      >
        <div
          className={`flex items-center justify-between p-2 pl-6 w-full pointer-events-auto transition-all duration-300 ease-in-out border border-black/5 rounded-full ${
            scrolled ? "max-w-5xl shadow-md bg-white/70 backdrop-blur-xl" : "max-w-6xl shadow-sm bg-white/60 backdrop-blur-lg"
          }`}
          style={{ WebkitBackdropFilter: scrolled ? "blur(24px)" : "blur(16px)" }}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0" aria-label="CaseMind">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>
              CaseMind
            </span>
          </a>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[15px] font-medium text-gray-600 hover:text-black rounded-full hover:bg-gray-100/50 transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-4">
            <Link
              href="/auth"
              className="text-[15px] font-medium text-gray-700 hover:text-black transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="text-[15px] font-medium bg-[#111111] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden ml-auto p-2 rounded-full text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-40 bg-white border border-gray-100 shadow-xl rounded-2xl p-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-black rounded-xl hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-gray-100 mt-3 pt-3 flex flex-col gap-2">
              <a href="#signin" className="btn-premium-secondary w-full">
                Sign In
              </a>
              <a href="#cta" className="btn-premium-primary w-full">
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
