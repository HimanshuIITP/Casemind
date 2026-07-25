"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "50,000+", label: "Legal documents analysed" },
  { value: "100+", label: "Supported document formats" },
  { value: "95%", label: "Time saved in research" },
  { value: "24/7", label: "AI legal assistance" },
];

export default function StatsSection() {
  return (
    <section className="py-20 border-b border-gray-100">
      <div className="container-tight px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-gray-100">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight" style={{ fontFamily: "var(--font-inter)" }}>
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
