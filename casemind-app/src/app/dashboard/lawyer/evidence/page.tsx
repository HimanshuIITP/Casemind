"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { formatDistanceToNow, parseISO } from "date-fns";
import { 
  FileText,
  Upload,
  Search,
  X,
  FileBox,
  Link as LinkIcon,
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Evidence {
  id: string;
  case_id: string;
  description: string;
  file_name?: string;
  file_url?: string;
  mime_type?: string;
  uploaded_at: string;
}

interface Case {
  id: string;
  case_id: string;
  title: string;
  client_name?: string;
}

export default function LawyerEvidencePage() {
  const router = useRouter();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [selectedCase, setSelectedCase] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch evidence
      const evRes = await axiosClient.get("/lawyer/evidence");
      setEvidenceList(evRes.data || []);
      
      // Fetch cases for the dropdown
      const casesRes = await axiosClient.get("/lawyer/cases?size=100");
      setCases(casesRes.data.items || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !description) return;

    setIsSubmitting(true);
    try {
      const payload = {
        case_id: selectedCase,
        description,
        file_name: fileName || "Untitled Document",
        file_url: fileUrl || "#",
        mime_type: "application/pdf" // default mock
      };
      
      const res = await axiosClient.post("/lawyer/evidence", payload);
      setEvidenceList(prev => [res.data, ...prev]);
      
      // Reset and close
      setSelectedCase("");
      setDescription("");
      setFileName("");
      setFileUrl("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to upload evidence", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvidence = evidenceList.filter(ev => 
    ev.description.toLowerCase().includes(search.toLowerCase()) || 
    ev.case_id.toLowerCase().includes(search.toLowerCase()) ||
    (ev.file_name && ev.file_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
            <div className="p-3 bg-[#C9971A]/10 rounded-xl">
              <FileBox className="w-6 h-6 text-[#C9971A]" />
            </div>
            Evidence Locker
          </h1>
          <p className="text-gray-500 mt-2 ml-14">Securely manage and upload digital evidence for your active cases.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#111111] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md"
        >
          <Upload className="w-5 h-5" />
          Upload Evidence
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search evidence by description, file name, or case ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#C9971A] outline-none font-medium"
          />
        </div>
      </div>

      {/* Evidence Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-[#E5E7EB]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[#C9971A] rounded-full animate-spin mb-4"></div>
          <p className="font-medium">Loading evidence locker...</p>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-[#E5E7EB]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <FileBox className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No Evidence Found</h3>
          <p className="text-gray-500 mt-2 max-w-md">You haven't uploaded any evidence yet, or no evidence matches your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvidence.map(ev => (
            <div 
              key={ev.id} 
              className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:shadow-lg transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] to-[#C9971A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-[#C9971A]/10 transition-colors">
                  <FileText className="w-6 h-6 text-gray-500 group-hover:text-[#C9971A]" />
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                  {formatDistanceToNow(parseISO(ev.uploaded_at), { addSuffix: true })}
                </span>
              </div>
              
              <h3 className="font-bold text-[#111111] text-lg mb-2 line-clamp-2">
                {ev.file_name || "Untitled Document"}
              </h3>
              
              <p className="text-sm text-gray-600 mb-6 flex-1">
                {ev.description}
              </p>
              
              <div className="pt-4 border-t border-[#E5E7EB] mt-auto">
                <div 
                  onClick={() => router.push(`/dashboard/lawyer/cases/${ev.case_id}`)}
                  className="flex items-center gap-2 text-sm font-bold text-[#111111] hover:text-[#C9971A] cursor-pointer transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Case {ev.case_id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#C9971A]/10 rounded-xl">
                  <Upload className="w-6 h-6 text-[#C9971A]" />
                </div>
                <h2 className="text-2xl font-bold text-[#111111]">Upload Evidence</h2>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Case *</label>
                  <select 
                    required
                    value={selectedCase}
                    onChange={(e) => setSelectedCase(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#C9971A] focus:bg-white outline-none font-medium appearance-none"
                  >
                    <option value="" disabled>Select an active case</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.case_id}>
                        {c.case_id} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                  <textarea 
                    required
                    placeholder="Briefly describe what this evidence contains..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#C9971A] focus:bg-white outline-none font-medium resize-none h-24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">File Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CCTV_Footage_Front_Door.mp4"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#C9971A] focus:bg-white outline-none font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">External Link / URL (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="url" 
                      placeholder="https://..."
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#C9971A] focus:bg-white outline-none font-medium"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">In a production app, this would be a file dropzone to S3/GCS.</p>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !selectedCase || !description}
                    className="w-full py-4 bg-[#111111] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      "Confirm & Upload"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
