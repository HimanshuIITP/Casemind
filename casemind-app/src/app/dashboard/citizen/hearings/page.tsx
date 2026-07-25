"use client";

import { useEffect, useState } from "react";
import { Gavel, Calendar, Clock, MapPin, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Hearing = {
  id: string;
  case_id: string;
  court: string;
  judge: string;
  date: string;
  time: string;
  status: string;
  remarks: string;
};

export default function HearingsPage() {
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHearings() {
      try {
        const data = await apiFetch("/hearings");
        setHearings(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHearings();
  }, []);

  if (loading && hearings.length === 0) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">Hearings Schedule</h1>
          <p className="text-gray-500 font-medium mt-1">Track your upcoming and past court dates.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hearings..."
            className="bg-white border border-[#E5E7EB] rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[#111111] transition-colors w-full md:w-64"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {hearings.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center shadow-sm">
            <div className="flex flex-col items-center text-gray-400">
              <Gavel className="w-12 h-12 mb-3" />
              <p className="text-[#111111] font-medium text-lg">No hearings scheduled</p>
              <p className="text-sm">You have no upcoming or past hearings recorded.</p>
            </div>
          </div>
        ) : (
          hearings.map((hearing) => (
            <div key={hearing.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-3 text-center min-w-[100px]">
                <div className="text-xs font-bold text-[#C9971A] uppercase tracking-wider mb-1">
                  {new Date(hearing.date).toLocaleString('default', { month: 'short' })}
                </div>
                <div className="text-2xl font-bold text-[#111111]">
                  {new Date(hearing.date).getDate()}
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-[#111111]">Case {hearing.case_id}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                    hearing.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                    hearing.status === "Completed" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {hearing.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {hearing.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {hearing.court}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gavel className="w-4 h-4" /> Judge {hearing.judge}
                  </div>
                </div>

                {hearing.remarks && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-3 border border-[#E5E7EB]">
                    <span className="font-semibold text-gray-700">Remarks:</span> {hearing.remarks}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
