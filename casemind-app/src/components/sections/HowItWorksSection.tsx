"use client";

import { motion } from "framer-motion";
import { Upload, Brain, Search, Gavel } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your case documents",
    desc: "Drop in any combination of FIRs, petitions, charge sheets, orders, or judgments. CaseMind supports all standard court document formats — PDFs, scanned files, and text.",
    visual: {
      bg: "#fef3c7",
      color: "#d97706",
      items: ["FIR", "Charge Sheet", "Petition", "Affidavit", "PM Report", "Court Order"],
    },
  },
  {
    step: "02",
    icon: Brain,
    title: "AI reads and structures the case",
    desc: "CaseMind extracts entities, organises a timeline, links related facts across documents, and indexes everything for fast retrieval — automatically.",
    visual: {
      bg: "#ede9fe",
      color: "#7c3aed",
      items: ["25 entities extracted", "8 dates identified", "3 legal provisions tagged", "2 inconsistencies flagged"],
    },
  },
  {
    step: "03",
    icon: Search,
    title: "Search and ask questions",
    desc: "Use natural language to find any fact across the entire case. The AI answers from the actual documents and cites the source, page number, and exhibit on every response.",
    visual: {
      bg: "#dbeafe",
      color: "#2563eb",
      items: ["\"What does the PM report say?\"", "\"Which IPC sections apply?\"", "\"Where does Witness 2 appear?\""],
    },
  },
  {
    step: "04",
    icon: Gavel,
    title: "You apply your legal judgment",
    desc: "With facts organised, timelines clear, and documents accessible, professionals focus on what only they can do — legal reasoning, advocacy, and judgment.",
    visual: {
      bg: "#d1fae5",
      color: "#059669",
      items: ["AI assists", "You decide"],
    },
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="badge mb-4 inline-flex"
          >
            How it works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="heading-lg mb-4"
          >
            From documents to clarity
            <br />
            <span style={{ color: "var(--text-secondary)" }}>in four steps.</span>
          </motion.h2>
        </div>

        <div className="space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="card p-7 flex flex-col md:flex-row gap-7 items-start md:items-center card-hover"
            >
              {/* Step number */}
              <div className="flex-shrink-0">
                <div
                  className="icon-chip"
                  style={{
                    width: 64,
                    height: 64,
                    background: step.visual.bg,
                    color: step.visual.color,
                  }}
                >
                  <step.icon style={{ width: 28, height: 28 }} />
                </div>
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-bold tracking-widest"
                    style={{ color: step.visual.color }}
                  >
                    STEP {step.step}
                  </span>
                </div>
                <h3
                  className="heading-md mb-2"
                  style={{ fontSize: "1.15rem" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {step.desc}
                </p>
              </div>

              {/* Visual chips */}
              <div className="flex-shrink-0 flex flex-wrap gap-2 max-w-xs">
                {step.visual.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium"
                    style={{
                      background: step.visual.bg,
                      color: step.visual.color,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
