"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase,
  AlertCircle
} from "lucide-react";

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

interface Case {
  id: string;
  case_id: string;
  title: string;
  court: string;
  status: string;
  priority: string;
}

export default function ClientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientDetails() {
      try {
        setLoading(true);
        // Fetch client details
        const res = await axiosClient.get(`/lawyer/clients/${clientId}`);
        setClient(res.data);

        // Fetch client's cases (assuming /cases endpoint can filter by client_id)
        // Here we just fetch all cases and filter for demonstration, or we would have a specific endpoint.
        // If the backend doesn't support querying cases by created_by via API, we handle empty gracefully.
        // Actually, we can fetch all cases and filter by created_by = clientId
        const casesRes = await axiosClient.get("/cases");
        const clientCases = casesRes.data.filter((c: any) => c.created_by === clientId);
        setCases(clientCases);
        
      } catch (err) {
        console.error("Failed to load client details", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-4 border-[#C9971A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-[#111111] mb-2">Client Not Found</h2>
        <p className="mb-6">The client you are looking for does not exist or you do not have permission to view them.</p>
        <button onClick={() => router.push("/dashboard/lawyer/clients")} className="px-6 py-2 bg-[#111111] text-white rounded-xl font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/lawyer/clients" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#111111] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-[#111111]">{client.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {client.status}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Client since {new Date(client.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2 bg-white border border-[#E5E7EB] rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Client
            </button>
            <button className="px-5 py-2 bg-[#111111] text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
              New Case
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
              <p className="font-medium text-[#111111]">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Phone Number</p>
              <p className="font-medium text-[#111111]">{client.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C9971A]/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-[#C9971A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Cases</p>
              <p className="font-medium text-[#111111]">{cases.length} Cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="text-xl font-bold text-[#111111]">Associated Cases</h2>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {cases.length > 0 ? (
            cases.map(c => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.case_id || "Draft"}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#111111]">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{c.court}</p>
                </div>
                <button className="shrink-0 px-4 py-2 border border-[#E5E7EB] text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100">
                  View Case
                </button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No cases associated with this client yet.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
