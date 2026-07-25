"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Clock, FileText, FileBox, Shield, MoreVertical, Calendar, Gavel, MapPin, Loader2, Sparkles, CheckCircle2, AlertCircle, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import AIWidget from "@/components/dashboard/AIWidget";
import axiosClient from "@/lib/axiosClient";
import ReactMarkdown from "react-markdown";

type CaseDetails = {
  id: string;
  case_id: string;
  title: string;
  description: string;
  court: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

type Document = {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
};

type Hearing = {
  id: string;
  court: string;
  judge: string;
  date: string;
  time: string;
  status: string;
  remarks: string;
};

type AISummary = {
  summary: string;
};

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;
  
  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [caseData, setCaseData] = useState<CaseDetails | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  
  // AI State
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleUploadDocument = async () => {
    if (!selectedFile) return;
    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("case_id", caseId);

      const res = await axiosClient.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update documents list
      setDocuments(prev => [res.data, ...prev]);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err: any) {
      alert("Upload failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploadingDoc(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [caseRes, timelineRes, docsRes, hearingsRes] = await Promise.all([
          axiosClient.get(`/cases/${caseId}`),
          axiosClient.get(`/timeline/${caseId}`),
          axiosClient.get(`/documents`, { params: { case_id: caseId } }),
          axiosClient.get(`/hearings`, { params: { case_id: caseId } })
        ]);
        
        setCaseData(caseRes.data);
        setTimeline(timelineRes.data);
        setDocuments(docsRes.data.items || docsRes.data || []);
        setHearings(hearingsRes.data.items || []);
        
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Failed to load case details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [caseId]);

  const generateReport = async () => {
    try {
      setIsGeneratingAI(true);
      setAiError(null);
      const res = await axiosClient.post(`/ai/case-summary/${caseId}`);
      setAiSummary({
        summary: res.data.summary
      });
    } catch (err: any) {
      // Handle the detailed HTTP exception we added in the backend
      setAiError(err.response?.data?.detail || "Unable to connect to AI service.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") return "bg-green-100 text-green-800";
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Error Loading Case</h2>
          <p>{error}</p>
          <Link href="/dashboard/citizen/cases" className="mt-6 inline-block px-4 py-2 bg-white rounded-lg font-medium shadow-sm hover:bg-gray-50 text-gray-700">
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link href="/dashboard/citizen/cases" className="text-gray-500 hover:text-[#111111] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to My Cases
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[#111111] capitalize">{caseData.title}</h1>
            <span className={`${getStatusColor(caseData.status)} text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize`}>
              {caseData.status}
            </span>
            {caseData.priority !== "normal" && (
               <span className={`bg-red-100 text-red-800 text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize`}>
                {caseData.priority.replace("_", " ")} Priority
              </span>
            )}
          </div>
          <p className="text-gray-500 font-medium">Case ID: {caseData.case_id} • {caseData.court} • {caseData.category}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111111] rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors inline-block"
          >
            Upload Document
          </button>
          <button className="px-4 py-2 bg-[#111111] text-white rounded-xl font-medium shadow-md hover:bg-gray-800 transition-colors">
            Contact Lawyer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden min-h-[500px]">
            <div className="flex border-b border-[#E5E7EB] px-2 overflow-x-auto hide-scrollbar">
              {["Overview", "Timeline", "Documents", "Hearings", "Orders"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab ? "border-[#C9971A] text-[#111111]" : "border-transparent text-gray-500 hover:text-[#111111] hover:border-gray-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === "Overview" && (
                <div className="space-y-12">
                  <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-6 rounded-xl border border-[#E5E7EB]">
                    <h3 className="text-gray-800 font-bold mb-2">Description</h3>
                    <p className="whitespace-pre-wrap">{caseData.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-[#111111] mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#C9971A]" />
                      Case Timeline
                    </h3>
                    
                    {timeline.length === 0 ? (
                       <p className="text-gray-500 italic ml-3">No timeline events recorded yet.</p>
                    ) : (
                      <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-4">
                        {timeline.slice(0, 3).map((item) => (
                          <div key={item.id} className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-white border-2 border-[#C9971A] rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                            <span className="text-xs font-bold text-[#C9971A] uppercase tracking-wider">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <h4 className="text-base font-bold text-[#111111] mt-1">{item.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {timeline.length > 3 && (
                      <button onClick={() => setActiveTab("Timeline")} className="ml-3 mt-4 text-sm font-bold text-[#C9971A] hover:underline">
                        View all {timeline.length} events
                      </button>
                    )}
                  </div>

                  <div>
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                         <FileText className="w-5 h-5 text-[#C9971A]" /> Recent Documents
                       </h3>
                       <button onClick={() => setActiveTab("Documents")} className="text-sm font-bold text-gray-500 hover:text-[#111111]">View All</button>
                     </div>
                     {documents.length === 0 ? (
                        <p className="text-gray-500 italic">No documents uploaded yet.</p>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {documents.slice(0, 2).map((doc) => (
                            <div key={doc.id} className="flex items-center gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.mime_type.includes('pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {doc.mime_type.includes('image') ? <FileBox className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-sm text-[#111111] group-hover:text-[#C9971A] transition-colors truncate">{doc.filename}</p>
                                <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                       </div>
                     )}
                  </div>
                </div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === "Timeline" && (
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2 mb-8">
                      <Clock className="w-5 h-5 text-[#C9971A]" /> Full History
                   </h3>
                   {timeline.length === 0 ? (
                       <p className="text-gray-500 italic">No timeline events recorded yet.</p>
                   ) : (
                      <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-4">
                        {timeline.map((item) => (
                          <div key={item.id} className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-white border-2 border-[#C9971A] rounded-full -left-[7px] top-1.5 ring-4 ring-white" />
                            <span className="text-xs font-bold text-[#C9971A] uppercase tracking-wider">
                              {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                            </span>
                            <h4 className="text-base font-bold text-[#111111] mt-1">{item.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === "Documents" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                      <FileBox className="w-5 h-5 text-[#C9971A]" /> Case Files
                    </h3>
                  </div>
                  {documents.length === 0 ? (
                       <p className="text-gray-500 italic">No documents uploaded yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-4 p-4 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.mime_type.includes('pdf') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              {doc.mime_type.includes('image') ? <FileBox className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-semibold text-sm text-[#111111] group-hover:text-[#C9971A] transition-colors truncate">{doc.filename}</p>
                              <p className="text-xs text-gray-500">{(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* HEARINGS TAB */}
              {activeTab === "Hearings" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2 mb-6">
                    <Gavel className="w-5 h-5 text-[#C9971A]" /> Court Hearings
                  </h3>
                  {hearings.length === 0 ? (
                    <div className="p-12 text-center border border-[#E5E7EB] border-dashed rounded-xl">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No hearings scheduled yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hearings.map((hearing) => (
                        <div key={hearing.id} className="bg-gray-50 border border-[#E5E7EB] rounded-xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
                          <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 text-center min-w-[90px] shadow-sm">
                            <div className="text-[10px] font-bold text-[#C9971A] uppercase tracking-wider mb-1">
                              {new Date(hearing.date).toLocaleString('default', { month: 'short' })}
                            </div>
                            <div className="text-xl font-bold text-[#111111]">
                              {new Date(hearing.date).getDate()}
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hearing.status === "Scheduled" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"}`}>
                                {hearing.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 pt-1">
                              <div className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-gray-400" /> {hearing.time}</div>
                              <div className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-gray-400" /> {hearing.court}</div>
                              <div className="flex items-center gap-1.5 font-medium"><Gavel className="w-4 h-4 text-gray-400" /> {hearing.judge}</div>
                            </div>
                            {hearing.remarks && <p className="text-sm text-gray-500 mt-2 bg-white p-2 rounded border border-gray-100">{hearing.remarks}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === "Orders" && (
                <div className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#111111]">Court Orders</h3>
                  <p className="text-gray-500 mt-1">Official court orders will appear here once issued by the judge.</p>
                </div>
              )}

            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Summary Card */}
          <div className="bg-[#111111] rounded-2xl border border-gray-800 shadow-xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9971A]/20 blur-3xl rounded-full pointer-events-none" />
            <div className="p-6 relative">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C9971A]" />
                  AI Intelligence
                </h3>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              {aiError ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                    <h4 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" /> AI Analysis Failed
                    </h4>
                    <p className="text-xs text-red-300/80">{aiError}</p>
                  </div>
                  <button 
                    onClick={generateReport}
                    disabled={isGeneratingAI}
                    className="w-full mt-2 py-3 bg-[#C9971A] hover:bg-[#b08417] text-[#111111] rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg"
                  >
                    {isGeneratingAI ? <><Loader2 className="w-4 h-4 animate-spin" /> Retrying Analysis...</> : "Retry AI Analysis"}
                  </button>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                        <ReactMarkdown>{aiSummary.summary}</ReactMarkdown>
                     </div>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-green-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Analysis Complete
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    CaseMind AI can analyze the petition facts, timeline, and uploaded documents to provide a comprehensive legal summary and identify missing critical evidence.
                  </p>
                  <button 
                    onClick={generateReport}
                    disabled={isGeneratingAI}
                    className="w-full mt-2 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isGeneratingAI ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Case...</> : "Generate Full Report"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <AIWidget caseId={caseId} />
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#111111]">Upload Document</h2>
              <button onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 hover:border-[#C9971A] transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#111111]">Click to browse or drag file here</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, PNG, JPG up to 10MB</p>
                </div>
              ) : (
                <div className="p-4 border border-[#E5E7EB] rounded-xl flex items-center justify-between bg-gray-50">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <FileText className="w-6 h-6 text-[#C9971A] flex-shrink-0" />
                     <div className="overflow-hidden">
                       <p className="text-sm font-bold text-[#111111] truncate">{selectedFile.name}</p>
                       <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                     </div>
                   </div>
                   <button onClick={() => setSelectedFile(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => { setIsUploadModalOpen(false); setSelectedFile(null); }}
                className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadDocument}
                disabled={!selectedFile || uploadingDoc}
                className="px-6 py-2 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploadingDoc ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Upload File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
