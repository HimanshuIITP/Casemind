"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User, Briefcase, Landmark, ArrowRight, ArrowLeft } from "lucide-react";

const roles = [
  {
    id: "citizen",
    title: "Citizen",
    desc: "File petitions, track cases, upload documents, receive updates, and interact securely with the judicial system.",
    icon: User,
    href: "/auth/citizen",
  },
  {
    id: "lawyer",
    title: "Lawyer",
    desc: "Manage clients, prepare legal research, analyze evidence, AI-assisted drafting, and organize court cases.",
    icon: Briefcase,
    href: "/auth/lawyer",
  },
  {
    id: "court",
    title: "Court",
    desc: "Secure portal for judges, registrars, and authorized court staff to manage proceedings and judicial workflows.",
    icon: Landmark,
    href: "/auth/court",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ChooseRolePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#FAFAFA]">
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 max-w-2xl"
      >
        <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <div className="w-6 h-6 border-[3px] border-[#C9971A] rounded-sm transform rotate-45" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Welcome to CaseMind
        </h1>
        <p className="text-lg text-gray-600">
          Select how you want to access the platform.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
      >
        {roles.map((role) => (
          <Link key={role.id} href={role.href} className="group outline-none">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="h-full bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all duration-300 group-hover:border-[#C9971A] group-hover:shadow-[0_16px_48px_rgba(201,151,26,0.08)] flex flex-col"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-[#C9971A]/10 transition-colors duration-300">
                <role.icon className="w-6 h-6 text-gray-700 group-hover:text-[#C9971A] transition-colors duration-300" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {role.title}
              </h2>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-8 flex-1">
                {role.desc}
              </p>

              <div className="inline-flex items-center gap-2 text-[15px] font-medium text-gray-900 group-hover:text-[#C9971A] transition-colors duration-300 mt-auto">
                Continue
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
