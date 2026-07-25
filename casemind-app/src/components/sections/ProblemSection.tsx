"use client";

import { motion } from "framer-motion";
import { FileText, Clock, Search, GitBranch, BookOpen, Layers } from "lucide-react";

const problems = [
  {
    icon: Layers,
    title: "Cases arrive as piles of unstructured documents",
    desc: "FIRs, petitions, charge sheets, witness statements, medical reports, orders, judgments — a single case can span dozens of document types across hundreds of pages.",
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
  },
  {
    icon: Clock,
    title: "Preparation time is dominated by navigation, not thinking",
    desc: "Before every hearing, significant time is spent locating the right document and rebuilding factual context from scratch — every single time.",
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    icon: Search,
    title: "Documents are stored, but never understood",
    desc: "Most systems are digital file cabinets. They index files, not the facts inside them. A name or legal provision buried in page 247 stays buried.",
    iconBg: "#fce7f3",
    iconColor: "#db2777",
  },
  {
    icon: GitBranch,
    title: "Contradictions across documents go unnoticed",
    desc: "When a witness statement contradicts a medical report, no system flags it. Humans catch these things — only when they have time to read everything.",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
  },
  {
    icon: BookOpen,
    title: "Every new case starts from zero",
    desc: "There is no persistent understanding that accumulates across hearings. Each session requires re-reading the same context and re-orienting to the same facts.",
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Administrative burden crowds out legal reasoning",
    desc: "When professionals spend their bandwidth locating information, there is less left for the work that actually requires their expertise.",
    iconBg: "#d1fae5",
    iconColor: "#059669",
  },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="section" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="heading-lg mb-4"
          >
            Legal information is abundant.
            <br />
            <span style={{ color: "var(--text-secondary)" }}>Access to it is not.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="body-lg max-w-xl mx-auto"
          >
            The challenge in case management isn't storage — it's that information is locked inside documents and never made usable.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="card card-hover p-6"
            >
              <div
                className="icon-chip w-11 h-11 mb-4"
                style={{ background: p.iconBg, color: p.iconColor }}
              >
                <p.icon className="w-5 h-5" />
              </div>
              <h3
                className="text-[17px] font-semibold mb-2 leading-snug tracking-tight min-h-[48px]"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-inter)" }}
              >
                {p.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-600">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
