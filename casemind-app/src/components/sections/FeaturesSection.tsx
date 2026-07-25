"use client";

import { motion } from "framer-motion";
import { FolderOpen, Brain, MessageSquare, Zap, Scale, Search, FileText, Users, MapPin, Calendar, Link2 } from "lucide-react";

const pillars = [
  {
    icon: FolderOpen,
    title: "Organise",
    desc: "Every document, hearing, order, and piece of evidence in one structured workspace. FIRs, charge sheets, petitions, and annexures — all versioned and instantly accessible.",
    tags: ["Documents", "Hearings", "Orders", "Evidence"],
    visual: { bg: "#fef3c7", color: "#d97706" },
    span: "col-span-1",
  },
  {
    icon: Brain,
    title: "Understand",
    desc: "Automatically extract people, organizations, dates, legal provisions, locations, and events — instead of leaving them buried in PDFs.",
    tags: ["People", "Dates", "IPC Sections"],
    visual: { bg: "#ede9fe", color: "#7c3aed" },
    span: "col-span-1",
  },
  {
    icon: MessageSquare,
    title: "Ask",
    desc: "An AI assistant that reads your case and answers questions grounded in the actual documents — with source citations on every response.",
    tags: ["Q&A", "Summaries", "Citations"],
    visual: { bg: "#dbeafe", color: "#2563eb" },
    span: "col-span-1",
  },
  {
    icon: Zap,
    title: "Find instantly",
    desc: "Retrieve any information in seconds. AI-powered semantic search understands legal language — not just keywords.",
    tags: ["Smart Search", "AI Indexing"],
    visual: { bg: "#d1fae5", color: "#059669" },
    span: "col-span-1",
  },
];

const miniFeatures = [
  { icon: Search, label: "Semantic legal search" },
  { icon: FileText, label: "Multi-document analysis" },
  { icon: Users, label: "Entity relationship mapping" },
  { icon: MapPin, label: "Location & event tracking" },
  { icon: Calendar, label: "Automated hearing timelines" },
  { icon: Link2, label: "Cross-document fact linking" },
  { icon: Scale, label: "Legal provision tagging" },
  { icon: Brain, label: "Contradiction detection" },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="badge mb-4 inline-flex"
          >
            Core Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="heading-lg mb-4"
          >
            Everything your case needs.
            <br />
            <span style={{ color: "var(--text-secondary)" }}>In one place.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="body-lg max-w-lg mx-auto"
          >
            CaseMind is built around four core pillars — each designed to reduce a specific class of friction in legal case management.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {pillars.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`card card-hover p-7 flex flex-col h-full ${f.span}`}
            >
              {/* Icon visual */}
              <div
                className="icon-chip w-12 h-12 mb-5"
                style={{ background: f.visual.bg, color: f.visual.color }}
              >
                <f.icon className="w-6 h-6" />
              </div>

              <h3
                className="heading-md mb-2"
                style={{ fontSize: "1.2rem" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: f.visual.bg,
                      color: f.visual.color,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mini features strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="card p-6"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-5"
            style={{ color: "var(--text-muted)" }}
          >
            Also included
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {miniFeatures.map((feat) => (
              <div
                key={feat.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-colors duration-150 hover:bg-gray-50 cursor-default"
              >
                <div
                  className="icon-chip w-9 h-9"
                  style={{ background: "#f5f5f7", color: "#555560" }}
                >
                  <feat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs leading-tight" style={{ color: "var(--text-secondary)" }}>
                  {feat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
