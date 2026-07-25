"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

// Real-sounding but clearly-labeled testimonials from illustrative beta personas
const testimonials = [
  {
    name: "Sessions Court Judge",
    role: "Criminal Division · District Court",
    initials: "SC",
    bg: "#fef3c7",
    color: "#d97706",
    quote:
      "The case summary feature saves considerable preparation time before each hearing. Instead of re-reading the entire file, I can orient to the key facts and disputes in minutes.",
    stars: 5,
  },
  {
    name: "Senior Advocate",
    role: "Criminal Practice · High Court",
    initials: "SA",
    bg: "#ede9fe",
    color: "#7c3aed",
    quote:
      "Managing multiple concurrent cases means I'm always switching context. Having all documents searchable and cross-linked makes preparation genuinely faster.",
    stars: 5,
  },
  {
    name: "Legal Aid Coordinator",
    role: "District Legal Services Authority",
    initials: "LC",
    bg: "#d1fae5",
    color: "#059669",
    quote:
      "For litigants who don't understand legal language, having the case explained in plain terms — with clear hearing timelines — makes an enormous difference.",
    stars: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section
      id="testimonials"
      className="section"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="heading-lg mb-4"
          >
            Trusted by legal professionals
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="body-lg max-w-md mx-auto"
          >
            Feedback from early access users across different roles in the legal system.
          </motion.p>
        </div>

        {/* Carousel — like the reference video */}
        <div className="flex items-center justify-center gap-5">
          {/* Side peek cards */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block w-56 h-72 card opacity-50 scale-90 origin-right"
            style={{ transform: "perspective(1000px) rotateY(12deg) scale(0.88)", transformOrigin: "right center" }}
          />

          {/* Main card */}
          <div className="relative w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="card p-8 text-center"
              >
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                  style={{ background: t.bg, color: t.color, fontFamily: "var(--font-geist-sans)" }}
                >
                  {t.initials}
                </div>

                {/* Name & role */}
                <h4
                  className="font-bold text-base mb-0.5"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-geist-sans)" }}
                >
                  {t.name}
                </h4>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                  {t.role}
                </p>

                {/* Stars */}
                <div className="flex justify-center gap-0.5 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {t.stars}.0
                  </span>
                </div>

                {/* Quote */}
                <p
                  className="text-sm leading-relaxed italic"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right peek */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block w-56 h-72 card opacity-50 scale-90 origin-left"
            style={{ transform: "perspective(1000px) rotateY(-12deg) scale(0.88)", transformOrigin: "left center" }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full card flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-md transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === current ? "20px" : "7px",
                  height: "7px",
                  background: i === current ? "var(--indigo)" : "var(--border)",
                }}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full card flex items-center justify-center text-gray-500 hover:text-gray-900 hover:shadow-md transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4.5 h-4.5" style={{ width: "1.125rem", height: "1.125rem" }} />
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          Perspectives from early access — roles and quotes are illustrative of user feedback themes.
        </p>
      </div>
    </section>
  );
}
