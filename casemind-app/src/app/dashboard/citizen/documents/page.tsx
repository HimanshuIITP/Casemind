"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, Download, Search, Filter } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Document = {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  case_id: string;
  created_at: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const data = await apiFetch("/documents");
      setDocuments(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (loading && documents.length === 0) return <div>Loading...</div>; // Managed by loading.tsx normally

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">My Documents</h1>
          <p className="text-gray-500 font-medium mt-1">View and manage all uploaded files and evidence.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="bg-white border border-[#E5E7EB] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#111111] transition-colors"
            />
          </div>
          <button className="p-2 border border-[#E5E7EB] rounded-xl bg-white text-gray-600 hover:text-[#111111] hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50">
        <ul className="divide-y divide-[#E5E7EB]">
          {documents.length === 0 ? (
             <li className="py-16 text-center">
             <div className="flex flex-col items-center text-gray-400">
               <FileText className="w-12 h-12 mb-3" />
               <p className="text-[#111111] font-medium text-lg">No documents found</p>
               <p className="text-sm">You haven't uploaded any files yet.</p>
             </div>
           </li>
          ) : (
            documents.map((doc) => (
              <li key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium">{doc.filename}</h3>
                    <p className="text-sm text-gray-500">
                      {formatBytes(doc.size)} • Uploaded {new Date(doc.created_at).toLocaleDateString()} • Case {doc.case_id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-[#C9971A] hover:bg-[#C9971A]/10 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
