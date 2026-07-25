import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

interface Benefit {
  label: string;
}

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subheading: string;
  benefits: Benefit[];
  backLink?: string;
}

export default function AuthLayout({
  children,
  heading,
  subheading,
  benefits,
  backLink = "/auth",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAFAFA]">
      {/* Left Side - Benefits (Hidden on small screens) */}
      <div className="hidden md:flex flex-col justify-between w-1/3 min-w-[400px] max-w-[500px] bg-white border-r border-gray-100 p-12 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,151,26,0.03),transparent_50%)] pointer-events-none" />

        <div className="relative z-10">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-16"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center mb-8">
              {/* Abstract logo mark */}
              <div className="w-6 h-6 border-[3px] border-[#C9971A] rounded-sm transform rotate-45" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              {heading}
            </h1>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              {subheading}
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-gray-700 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#C9971A]" />
                  {benefit.label}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="relative z-10 text-sm text-gray-400">
          © {new Date().getFullYear()} CaseMind. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Mobile back button & logo */}
        <div className="md:hidden w-full max-w-[480px] flex items-center justify-between mb-8">
          <div className="w-10 h-10 bg-[#111111] rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 border-[2px] border-[#C9971A] rounded-sm transform rotate-45" />
          </div>
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
