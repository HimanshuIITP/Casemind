"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck, CheckCircle2, Search, Brain, Scale, FileText, UploadCloud, FileClock } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#FAFAFA]">
      {/* Extremely subtle grid background */}
      <div 
        className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" 
        style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}
      />

      <div className="container-tight px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column: Copy */}
          <div className="flex-1 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="heading-display mb-5">
                Justice deserves<br />better software.
              </h1>
              
              <p className="text-[22px] font-semibold text-gray-900 mb-4 leading-tight">
                The operating system powering lawyers, courts, and litigants.
              </p>
              
              <p className="body-md mb-8 max-w-lg">
                CaseMind transforms fragmented legal documents into a searchable, AI-powered workspace that accelerates legal research, document analysis, case preparation, and courtroom decision-making.
              </p>

              <div className="flex items-center gap-4 mb-10 flex-wrap">
                <a href="#cta" className="btn-premium-primary group">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#demo" className="btn-premium-secondary">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {[
                  "Secure by Design",
                  "Court Ready",
                  "AI Assisted",
                  "Built for Indian Judiciary"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#C9971A]" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: UI Mockup */}
          <div className="flex-1 w-full lg:w-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-gray-200 bg-white shadow-floating overflow-hidden"
              style={{ transformStyle: "preserve-3d", transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)" }}
            >
              {/* Fake UI Header */}
              <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="h-7 w-48 bg-white border border-gray-200 rounded-md flex items-center px-2 ml-4">
                    <Search className="w-3 h-3 text-gray-400 mr-2" />
                    <div className="h-1.5 w-16 bg-gray-200 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center">
                    <UploadCloud className="w-3 h-3 text-gray-500" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-900" />
                </div>
              </div>

              {/* Fake UI Body */}
              <div className="flex h-[420px] bg-gray-50/50 p-3 gap-3">
                {/* Left Sidebar: Timeline & Evidence */}
                <div className="w-1/3 flex flex-col gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex-1">
                    <div className="flex items-center gap-1.5 mb-3">
                      <FileClock className="w-3 h-3 text-gray-400" />
                      <div className="h-2 w-16 bg-gray-300 rounded-full" />
                    </div>
                    <div className="space-y-3 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-2 relative z-10 pl-3">
                          <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-white bg-blue-500" />
                          <div className="space-y-1 w-full">
                            <div className="h-2 w-12 bg-gray-200 rounded-full" />
                            <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm h-1/3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <div className="h-2 w-12 bg-gray-300 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-blue-50 rounded border border-blue-100" />
                      <div className="h-8 bg-green-50 rounded border border-green-100" />
                    </div>
                  </div>
                </div>

                {/* Main Content: Doc Viewer & Analytics */}
                <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative overflow-hidden flex flex-col">
                  <div className="h-3 w-1/2 bg-gray-900 rounded-full mb-6" />
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full" />
                      <div className="h-2 w-11/12 bg-gray-100 rounded-full" />
                      <div className="h-2 w-full bg-gray-100 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full" />
                      <div className="h-2 w-4/5 bg-gray-100 rounded-full" />
                      <div className="h-2 w-full bg-gray-100 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Highlighted Citation Popover */}
                  <div className="absolute top-24 left-12 right-12 bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-md flex items-start gap-2">
                    <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="space-y-1.5 w-full">
                      <div className="h-2 w-32 bg-amber-600/40 rounded-full" />
                      <div className="h-1.5 w-full bg-amber-600/20 rounded-full" />
                      <div className="h-1.5 w-4/5 bg-amber-600/20 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Right Sidebar: AI Assistant */}
                <div className="w-1/4 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-8 border-b border-gray-100 flex items-center px-2 gap-1.5 bg-gray-50">
                    <Brain className="w-3 h-3 text-purple-600" />
                    <div className="h-2 w-16 bg-gray-300 rounded-full" />
                  </div>
                  <div className="p-2 flex-1 flex flex-col gap-2 justify-end">
                    <div className="bg-gray-100 rounded-lg p-2 rounded-bl-none text-[10px] text-gray-600 leading-tight">
                      Analyzing 432 pages of FIR and annexures...
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-2 rounded-br-none text-[10px] text-purple-900 leading-tight self-end w-11/12 shadow-sm">
                      Found 3 contradictions in witness statement regarding timeline.
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <div className="h-6 w-full bg-gray-50 border border-gray-200 rounded-md flex items-center px-2">
                      <div className="h-1.5 w-12 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
