"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { Bot, Scale, FileText, ArrowRight, Loader2, Search, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface AssignedCase {
  id: string;
  case_id: string;
  title: string;
  status: string;
  court: string;
}

export default function AIBenchBriefPage() {
  const [cases, setCases] = useState<AssignedCase[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  
  const [selectedCase, setSelectedCase] = useState<AssignedCase | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [brief, setBrief] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch assigned cases for the judge
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axiosClient.get("/court/dashboard");
        setCases(res.data.assigned_cases || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCases(false);
      }
    };
    fetchCases();
  }, []);

  const handleGenerateBrief = async (c: AssignedCase) => {
    setSelectedCase(c);
    setBrief(null);
    setError(null);
    setGenerating(true);
    try {
      const res = await axiosClient.post(`/ai/bench-brief/${c.case_id}`);
      setBrief(res.data.summary);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate Bench Brief.");
    } finally {
      setGenerating(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.case_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-16 h-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
          <Bot className="w-8 h-8 text-[#C9971A]" /> AI Bench Brief
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Generate highly structured, objective Case Intelligence Reports for your assigned matters.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-[600px]">
        {/* Left Sidebar: Case Selection */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#C9971A]" /> Assigned Cases
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search case ID or title..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9971A] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loadingCases ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredCases.length > 0 ? (
              filteredCases.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => handleGenerateBrief(c)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedCase?.id === c.id 
                      ? "bg-[#111111] text-white border-[#111111] shadow-md" 
                      : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                      selectedCase?.id === c.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {c.case_id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedCase?.id === c.id ? "bg-white/10" : "bg-blue-50 text-blue-600"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm line-clamp-2 mt-2 leading-snug">{c.title}</h3>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 text-gray-500">
                <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                <p className="text-sm">No cases found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Content: AI Output */}
        <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-[#E5E7EB] shadow-sm flex flex-col relative overflow-hidden">
          {/* Header decoration */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C9971A] to-yellow-600" />
          
          {!selectedCase && !generating && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <Bot className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">Select a Case to Analyze</h2>
              <p className="max-w-md">The CaseMind AI will instantly generate a comprehensive Bench Brief, scanning timeline events, hearings, and evidence for inconsistencies and legal issues.</p>
            </div>
          )}

          {generating && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-gray-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-[#C9971A] rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <Bot className="w-8 h-8 text-[#111111] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-xl font-bold text-[#111111] mb-2">Generating Bench Brief...</h2>
              <p className="text-gray-500 max-w-sm">Analyzing timeline, synthesizing evidence, and formulating judicial questions for {selectedCase?.case_id}.</p>
            </div>
          )}

          {error && !generating && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-500">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <h2 className="text-lg font-bold mb-2">Generation Failed</h2>
              <p className="text-sm text-red-400">{error}</p>
              <button 
                onClick={() => selectedCase && handleGenerateBrief(selectedCase)}
                className="mt-6 px-6 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {brief && !generating && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h2 className="text-lg font-bold text-[#111111]">AI Bench Brief</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">Case: {selectedCase?.case_id}</p>
                  </div>
                  <div className="px-3 py-1 bg-[#111111] text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    AI Generated
                  </div>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto prose prose-sm md:prose-base max-w-none prose-headings:text-[#111111] prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mb-4 prose-h2:mt-8 prose-p:text-gray-700 prose-li:text-gray-700">
                  <ReactMarkdown>{brief}</ReactMarkdown>
                </div>

                <div className="p-6 border-t border-[#E5E7EB] bg-gray-50/80 flex justify-end">
                  <Link 
                    href={`/dashboard/court/cases/${selectedCase?.case_id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Open Full Case Workspace <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
