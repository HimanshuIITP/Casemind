"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export default function SectionHeader({
  badge,
  title,
  subtitle,
  centered = true,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5 ${centered ? "mx-auto" : ""}`}
          style={{
            background: "rgba(201, 162, 39, 0.1)",
            border: "1px solid rgba(201, 162, 39, 0.25)",
            color: "hsl(43, 74%, 62%)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-gold"
            style={{ background: "hsl(43, 74%, 52%)" }}
          />
          {badge}
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-5 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl ${centered ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
