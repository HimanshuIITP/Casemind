"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <section id="cta" className="section pb-32" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card p-10 md:p-14 text-center relative overflow-hidden"
          style={{ background: "var(--surface)" }}
        >
          {/* Subtle background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(108,92,231,0.08) 0%, transparent 60%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="badge mb-6 inline-flex">
              Early Access Program
            </span>

            <h2 className="heading-lg mb-5">
              Ready to modernise your case management?
            </h2>
            <p className="body-lg mb-10">
              Join leading legal professionals who are already reducing document review time and finding crucial case facts instantly with CaseMind.
            </p>

            {!success ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto relative flex flex-col sm:flex-row gap-3 sm:gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl text-sm outline-none transition-all duration-200 w-full"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--indigo)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(108,92,231,0.15)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium-primary justify-center w-full sm:w-auto"
                  style={{ padding: "14px 24px", borderRadius: "12px" }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </>
                  ) : (
                    <>
                      Register
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto p-5 rounded-xl text-center"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
              >
                <div className="flex justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800 mb-1">Request Received</h3>
                <p className="text-sm text-green-700">
                  We'll be in touch with you shortly at {email}.
                </p>
              </motion.div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" style={{ color: "var(--indigo)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Enterprise-grade security
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--indigo)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
