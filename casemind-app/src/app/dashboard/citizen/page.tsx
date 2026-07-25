"use client";

import { useEffect, useState } from "react";
import { Briefcase, Gavel, FileBox, MessageSquareWarning } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickActions from "@/components/dashboard/QuickActions";
import AIWidget from "@/components/dashboard/AIWidget";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  stats: {
    active_cases: number;
    pending_hearings: number;
    uploaded_documents: number;
    ai_queries: number;
  };
  recent_cases: any[];
  notifications: any[];
  upcoming_hearings: any[];
};

export default function CitizenDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await apiFetch("/dashboard/citizen");
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-500">Failed to load dashboard: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight mb-2">
            Good Evening, {data.user.name.split(" ")[0]} <span className="inline-block hover:rotate-12 transition-transform duration-300">👋</span>
          </h1>
          <p className="text-gray-500 font-medium">Manage your legal matters from one secure workspace.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Cases" value={data.stats.active_cases} icon={Briefcase} />
        <StatsCard title="Pending Hearings" value={data.stats.pending_hearings} icon={Gavel} />
        <StatsCard title="Uploaded Documents" value={data.stats.uploaded_documents} icon={FileBox} />
        <StatsCard title="AI Queries" value={data.stats.ai_queries} icon={MessageSquareWarning} />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-[#111111] mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Inline Recent Cases Table replacing mock component */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50">
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#111111]">Recent Cases</h3>
              <Link href="/dashboard/citizen/cases" className="text-sm font-medium text-gray-500 hover:text-[#111111] transition-colors">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {data.recent_cases.length === 0 ? (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-400">No recent cases.</td></tr>
                  ) : (
                    data.recent_cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-4 px-6 text-sm font-medium text-[#111111]">
                          <Link href={`/dashboard/citizen/cases/${c.case_id}`} className="hover:underline">{c.case_id}</Link>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{c.title}</td>
                        <td className="py-4 px-6 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === "Active" ? "bg-green-100 text-green-800" :
                            c.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        <div className="lg:col-span-1">
          <AIWidget />
        </div>
      </div>
    </div>
  );
}
