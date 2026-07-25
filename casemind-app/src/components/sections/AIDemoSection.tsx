"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, User, FileText, Info } from "lucide-react";

const demoConversation = [
  {
    id: 1,
    role: "user",
    message: "Give me a quick summary of what this case is about.",
    delay: 0,
  },
  {
    id: 2,
    role: "ai",
    message:
      "Based on the uploaded documents, this is a criminal matter under IPC Section 302. The FIR was registered on 14 March. The charge sheet was filed about three weeks later. Three witnesses are named across the filings, and a post-mortem report has been submitted as medical evidence.",
    sources: ["FIR · Page 1", "Charge Sheet · Pages 2–3", "PM Report · Exhibit C"],
    delay: 800,
  },
  {
    id: 3,
    role: "user",
    message: "Does the medical report contradict anything in the FIR?",
    delay: 2000,
  },
  {
    id: 4,
    role: "ai",
    message:
      "The post-mortem places estimated time of death between 11 PM and 1 AM. The FIR records the complainant's statement placing the incident closer to 10 PM — a discrepancy worth examining during cross-examination.",
    sources: ["PM Report · Page 4", "FIR · Page 2"],
    highlight: "Timeline inconsistency found across two documents.",
    delay: 2900,
  },
];

interface Message {
  id: number;
  role: string;
  message: string;
  sources?: string[];
  highlight?: string;
  delay: number;
}

export default function AIDemoSection() {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          playDemo();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  const playDemo = () => {
    setVisibleMessages([]);
    demoConversation.forEach((msg, i) => {
      setTimeout(
        () => {
          if (msg.role === "ai") setIsTyping(true);
          setTimeout(
            () => {
              setIsTyping(false);
              setVisibleMessages((prev) => [...prev, msg]);
              containerRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
            },
            msg.role === "ai" ? 1100 : 0
          );
        },
        msg.delay + i * 300
      );
    });
  };

  return (
    <section ref={sectionRef} id="demo" className="section" style={{ background: "var(--surface-2)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="badge mb-4 inline-flex"
          >
            AI in Action
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="heading-lg mb-4"
          >
            Ask anything.
            <br />
            <span style={{ color: "var(--text-secondary)" }}>Get answers from the case itself.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="body-lg max-w-md mx-auto"
          >
            The AI reads your case documents and answers from what's actually there — citing the source document and page on every response.
          </motion.p>
        </div>

        {/* Illustrative label */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <Info className="w-3 h-3" />
            Illustrative — showing the type of questions CaseMind handles
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Chat window */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 card overflow-hidden"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="icon-chip w-8 h-8"
                  style={{ background: "#ede9fe", color: "#7c3aed" }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    CaseMind AI
                  </p>
                  <p className="text-xs flex items-center gap-1" style={{ color: "#16a34a" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                    Reading case documents
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={containerRef}
              className="h-80 overflow-y-auto p-5 space-y-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
            >
              {visibleMessages.length === 0 && !isTyping && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div
                    className="icon-chip w-10 h-10"
                    style={{ background: "#ede9fe", color: "#7c3aed" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Scroll into view to see the demo
                  </p>
                </div>
              )}

              {visibleMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div
                      className="icon-chip w-7 h-7 mr-2 flex-shrink-0 mt-0.5"
                      style={{ background: "#ede9fe", color: "#7c3aed" }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="max-w-[80%] space-y-2">
                    <div
                      className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: msg.role === "user" ? "#111111" : "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: msg.role === "user" ? "white" : "var(--text-primary)",
                        borderRadius: msg.role === "user"
                          ? "14px 14px 4px 14px"
                          : "4px 14px 14px 14px",
                      }}
                    >
                      {msg.message}
                    </div>

                    {msg.highlight && (
                      <div
                        className="rounded-xl px-4 py-2.5 text-xs leading-relaxed"
                        style={{
                          background: "#fef3c7",
                          border: "1px solid #fde68a",
                          color: "#92400e",
                          borderLeft: "3px solid #f59e0b",
                        }}
                      >
                        ⚠ {msg.highlight}
                      </div>
                    )}

                    {msg.sources && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((source) => (
                          <span
                            key={source}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: "#fef3c7", color: "#d97706" }}
                          >
                            <FileText className="w-3 h-3" />
                            {source}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div
                      className="icon-chip w-7 h-7 ml-2 flex-shrink-0 mt-0.5"
                      style={{ background: "#f3f4f6", color: "#374151" }}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="icon-chip w-7 h-7"
                    style={{ background: "#ede9fe", color: "#7c3aed" }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-xl flex items-center gap-1.5"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    {[0, 0.2, 0.4].map((d) => (
                      <div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        style={{ animation: `pulse-dot 1.2s ${d}s infinite` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <input
                  type="text"
                  placeholder="Ask anything about this case…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-muted)" }}
                  readOnly
                  aria-label="Demo input"
                />
                <button
                  className="icon-chip w-8 h-8"
                  style={{ background: "#111111", color: "white" }}
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: What it does */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {[
              {
                title: "Reads your documents, not the internet",
                desc: "The AI operates only on documents you upload. It has no access to outside information.",
                bg: "#fef3c7",
                color: "#d97706",
              },
              {
                title: "Cites the source, every time",
                desc: "Every answer includes the document name and page number so you can verify in seconds.",
                bg: "#dbeafe",
                color: "#2563eb",
              },
              {
                title: "Flags inconsistencies",
                desc: "When evidence is contradictory across documents, the AI surfaces it rather than picking a side.",
                bg: "#ede9fe",
                color: "#7c3aed",
              },
              {
                title: "Never makes legal conclusions",
                desc: "CaseMind won't tell you who is guilty or how to rule. That's not its job.",
                bg: "#d1fae5",
                color: "#059669",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card p-4 flex items-start gap-3 card-hover"
              >
                <div
                  className="icon-chip w-9 h-9 flex-shrink-0 mt-0.5"
                  style={{ background: item.bg, color: item.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-geist-sans)" }}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setHasStarted(false);
                setVisibleMessages([]);
                setIsTyping(false);
                setTimeout(() => {
                  setHasStarted(true);
                  playDemo();
                }, 100);
              }}
              className="btn-outline w-full justify-center mt-1"
            >
              ↺ Replay conversation
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
