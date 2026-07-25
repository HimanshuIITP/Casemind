"use client";

import { motion } from "framer-motion";

const trustLabels = [
  "Courts",
  "Law Firms",
  "Legal Aid",
  "Government Departments",
  "Universities",
  "Corporate Legal Teams"
];

export default function TrustedBySection() {
  return (
    <section className="py-24 bg-[#FAFAFA] border-b border-gray-100">
      <div className="container-tight px-6 text-center">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-10">
          Designed For
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-60 grayscale">
          {trustLabels.map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
