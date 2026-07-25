"use client";

import { motion } from "framer-motion";
import { Gavel, Briefcase, User, CheckCircle2, FileSearch, Clock, Scale, MessageSquareText, Upload, Bell, Eye, BookOpen, Search, Lightbulb, Shield } from "lucide-react";

const users = [
  {
    id: "judge",
    label: "For Judges",
    icon: Gavel,
    tagline: "Command the full picture. Decide with confidence.",
    desc: "Judges receive a consolidated, AI-organised view of the case. Spend judicial energy on reasoning, not document hunting.",
    iconBg: "#fef3c7",
    iconColor: "#d97706",
    accent: "#d97706",
    features: [
      { icon: FileSearch, label: "AI-generated case summary on open" },
      { icon: Clock, label: "Visual hearing timeline across all filings" },
      { icon: Scale, label: "Evidence organised with legal tags" },
      { icon: MessageSquareText, label: "Case-grounded AI assistant" },
      { icon: BookOpen, label: "Navigate hundreds of pages in seconds" },
      { icon: Shield, label: "AI assists — judge decides, always" },
    ],
  },
  {
    id: "lawyer",
    label: "For Lawyers",
    icon: Briefcase,
    tagline: "Know your case inside out before you walk in.",
    desc: "Lawyers get an intelligent workspace to search evidence, understand facts quickly, and prepare arguments faster than ever before.",
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
    accent: "#7c3aed",
    features: [
      { icon: FileSearch, label: "Review case documents rapidly" },
      { icon: Search, label: "Semantic search across all filings" },
      { icon: Lightbulb, label: "AI surfaces key facts and gaps" },
      { icon: MessageSquareText, label: "AI assistant for argument prep" },
      { icon: BookOpen, label: "Navigate and compare evidence" },
      { icon: Scale, label: "Legal provision cross-referencing" },
    ],
  },
  {
    id: "petitioner",
    label: "For Petitioners",
    icon: User,
    tagline: "Know exactly where your case stands, always.",
    desc: "Petitioners get transparent visibility — filing, hearing updates, court orders, and judgments — without chasing information.",
    iconBg: "#d1fae5",
    iconColor: "#059669",
    accent: "#059669",
    features: [
      { icon: Upload, label: "File a case and upload documents" },
      { icon: Eye, label: "Monitor case progress in real time" },
      { icon: Bell, label: "Instant hearing updates and reminders" },
      { icon: FileSearch, label: "View court orders and judgments" },
      { icon: Clock, label: "Full case timeline at a glance" },
      { icon: Scale, label: "Court decisions in plain language" },
    ],
  },
];

export default function UsersSection() {
  return (
    <section id="users" className="section" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="heading-lg mb-4"
          >
            Built for everyone
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="body-lg max-w-lg mx-auto"
          >
            Whether you're a judge, lawyer, or petitioner — CaseMind has a dedicated workspace designed for your role.
          </motion.p>
        </div>

        {/* Three-card layout like the reference video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="card card-hover p-6 flex flex-col"
            >
              {/* Icon visual area */}
              <div
                className="w-full rounded-2xl flex items-center justify-center mb-5"
                style={{
                  height: 140,
                  background: user.iconBg,
                }}
              >
                <div
                  className="icon-chip"
                  style={{
                    width: 72,
                    height: 72,
                    background: "white",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    color: user.iconColor,
                  }}
                >
                  <user.icon style={{ width: 32, height: 32 }} />
                </div>
              </div>

              <h3
                className="heading-md mb-2"
                style={{ fontSize: "1.15rem" }}
              >
                {user.label}
              </h3>
              <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
                {user.desc}
              </p>

              {/* Feature list */}
              <ul className="space-y-2 mt-auto">
                {user.features.map((feat) => (
                  <li key={feat.label} className="flex items-center gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: user.accent }}
                    />
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {feat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
