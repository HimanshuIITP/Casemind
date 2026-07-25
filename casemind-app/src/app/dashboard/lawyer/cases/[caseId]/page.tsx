"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import Link from "next/link";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle,
  FileEdit,
  Clock,
  Download,
  Bot,
  FileText,
  Gavel,
  BookOpen,
  ChevronRight,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LawyerCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchCaseDetails() {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/lawyer/cases/${caseId}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load case details", err);
      } finally {
        setLoading(false);
      }
    }
    if (caseId) fetchCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-4 border-[#C9971A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-[#111111] mb-2">Case Not Found</h2>
        <p className="mb-6">The case you are looking for does not exist or you do not have permission to view it.</p>
        <button onClick={() => router.push("/dashboard/lawyer/cases")} className="px-6 py-2 bg-[#111111] text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const { case_info, timeline, evidence, documents, hearings, orders, notes, ai_summary } = data;

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
      case "very_urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
      case "dismissed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "evidence", label: "Evidence", icon: FileText },
    { id: "documents", label: "Documents", icon: Download },
    { id: "hearings", label: "Hearings", icon: Calendar },
    { id: "orders", label: "Orders", icon: Gavel },
    { id: "notes", label: "Notes", icon: FileEdit },
    { id: "ai", label: "AI Intelligence", icon: Bot },
  ];

  const upcomingHearing = hearings?.find((h: any) => h.status === "Scheduled");

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/lawyer/cases" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#111111] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Assigned Cases
        </Link>
      </div>

      {/* Case Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-bold">
                {case_info.case_id}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(case_info.status)}`}>
                {case_info.status}
              </span>
              {case_info.priority && case_info.priority !== 'normal' && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(case_info.priority)}`}>
                  {case_info.priority.replace("_", " ")}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-[#111111] mb-2">{case_info.title}</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-[#C9971A] text-white rounded-xl font-bold hover:bg-[#b08517] transition-colors shadow-sm flex items-center gap-2">
              <Bot className="w-4 h-4" /> AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left, 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-1 flex overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    isActive ? "bg-[#111111] text-white shadow-md" : "text-gray-500 hover:text-[#111111] hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-[#111111] mb-3">Case Summary</h3>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{case_info.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-[#E5E7EB]">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Participants</p>
                        <div className="space-y-3 mt-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Petitioner</p>
                              <p className="font-semibold text-sm">{case_info.client_name || "Unknown"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Respondent</p>
                              <p className="font-semibold text-sm">{case_info.respondent_name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-xl border border-[#E5E7EB]">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Court Details</p>
                        <div className="flex items-start gap-3 mt-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#111111]">{case_info.court}</p>
                            <p className="text-xs text-gray-500 mt-1">Filed on {new Date(case_info.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIMELINE TAB */}
                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[#111111]">Timeline of Events</h3>
                    {timeline && timeline.length > 0 ? (
                      <div className="relative border-l-2 border-[#E5E7EB] ml-3 space-y-8 pb-4">
                        {timeline.map((item: any) => (
                          <div key={item.id} className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#C9971A]"></div>
                            <p className="text-xs font-bold text-gray-400">{new Date(item.date).toLocaleString()}</p>
                            <h4 className="font-bold text-[#111111] mt-1">{item.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No timeline events recorded.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* EVIDENCE TAB */}
                {activeTab === "evidence" && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-[#111111]">Evidence Log</h3>
                      <button className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                        <Plus className="w-4 h-4" /> Add Evidence
                      </button>
                    </div>
                    {evidence && evidence.length > 0 ? (
                      <div className="space-y-3">
                        {evidence.map((item: any) => (
                          <div key={item.id} className="p-4 border border-[#E5E7EB] rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <h4 className="font-bold text-sm text-[#111111]">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Uploaded {new Date(item.uploaded_at).toLocaleDateString()} by {item.uploaded_by}</p>
                              </div>
                            </div>
                            <button className="p-2 text-gray-500 hover:text-[#111111] bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No evidence uploaded yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI INTELLIGENCE TAB */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#C9971A]/10 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#C9971A]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#111111]">AI Case Intelligence</h3>
                    </div>
                    
                    {ai_summary ? (
                      <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-6 rounded-xl border border-[#E5E7EB]">
                        <p className="whitespace-pre-wrap">{ai_summary}</p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-[#E5E7EB]">
                        <Bot className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="font-medium text-gray-700">No AI analysis available for this case.</p>
                        <button className="mt-4 px-4 py-2 bg-[#111111] text-white rounded-lg text-sm font-bold hover:bg-gray-800">
                          Generate Analysis Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* OTHER TABS (Documents, Hearings, Orders, Notes) */}
                {["documents", "hearings", "orders", "notes"].includes(activeTab) && (
                  <div className="text-center py-16 text-gray-500">
                    <p className="font-medium text-lg">No {activeTab} available.</p>
                    <p className="text-sm mt-1">This section is currently empty for this case.</p>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          
          {/* AI Summary Widget */}
          <div className="bg-gradient-to-br from-[#111111] to-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9971A]/10 rounded-bl-full"></div>
            <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#C9971A]" /> AI Quick Summary
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
              {ai_summary || "AI analysis indicates this case requires evidence gathering. The respondent has not yet filed a reply."}
            </p>
            <button 
              onClick={() => setActiveTab("ai")}
              className="text-[#C9971A] text-sm font-bold flex items-center gap-1 hover:text-[#b08517]"
            >
              Read full analysis <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upcoming Hearing */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
            <h3 className="text-[#111111] font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" /> Upcoming Hearing
            </h3>
            {upcomingHearing ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-red-700 font-bold text-sm mb-1">{new Date(upcomingHearing.date).toLocaleDateString()}</p>
                <p className="text-[#111111] font-semibold">{upcomingHearing.type}</p>
                <p className="text-gray-500 text-sm mt-1">{upcomingHearing.court}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No hearings scheduled.</p>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
            <h3 className="text-[#111111] font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => router.push("/dashboard/lawyer/evidence")}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-[#E5E7EB] transition-all"
              >
                <FileText className="w-5 h-5 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-gray-700 text-center">Upload Evidence</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-[#E5E7EB] transition-all">
                <FileEdit className="w-5 h-5 text-purple-600 mb-2" />
                <span className="text-xs font-bold text-gray-700 text-center">Generate Notes</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-[#E5E7EB] transition-all">
                <BookOpen className="w-5 h-5 text-orange-600 mb-2" />
                <span className="text-xs font-bold text-gray-700 text-center">Legal Research</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-[#E5E7EB] transition-all">
                <FileText className="w-5 h-5 text-green-600 mb-2" />
                <span className="text-xs font-bold text-gray-700 text-center">Draft Document</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Mini */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm p-6">
            <h3 className="text-[#111111] font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
            </h3>
            {timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9971A] mt-2 shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111] leading-snug">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No recent activity.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
