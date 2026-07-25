"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import {
  Briefcase, Calendar as CalIcon, Clock, Gavel, FileText, Bot,
  Bell, ChevronRight, AlertCircle, Shield, ArrowRight,
  BookOpen, Eye, Scale
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ────────── Types ────────── */
interface PriorityItem { id: string; title: string; type: string; time?: string; urgent: boolean; }
interface CauseListItem { id: string; case_id: string; case_title: string; date: string; court: string; courtroom: string; petitioner: string; respondent: string; advocates: string; status: string; priority: string; }
interface AssignedCase { id: string; case_id: string; title: string; status: string; court: string; priority: string; petitioner: string; respondent: string; next_hearing?: string; last_hearing?: string; stage: string; }
interface PendingOrder { id: string; case_id: string; title: string; status: string; date: string; }
interface EvidenceItem { id: string; case_id: string; description: string; file_name: string; uploaded_at: string; }
interface AIInsight { id: string; title: string; description: string; type: string; case_id?: string; }
interface CalendarItem { id: string; case_id: string; case_title: string; date: string; court: string; }
interface Notification { id: string; message: string; created_at: string; read: boolean; }

interface CourtDashboardData {
  judge: { id: string; name: string; email: string; designation: string; court_id: string; role: string; };
  stats: {
    cases_listed_today: number; pending_judgments: number; hearings_scheduled: number;
    evidence_awaiting: number; urgent_matters: number; unread_notifications: number;
  };
  today_priorities: PriorityItem[];
  cause_list: CauseListItem[];
  assigned_cases: AssignedCase[];
  pending_orders: PendingOrder[];
  evidence_review: EvidenceItem[];
  ai_insights: AIInsight[];
  calendar: CalendarItem[];
  notifications: Notification[];
}

/* ────────── Helpers ────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const statusColor = (s: string) => {
  switch (s.toLowerCase()) {
    case "active": return "bg-emerald-100 text-emerald-700";
    case "pending": return "bg-amber-100 text-amber-700";
    case "reserved": case "judgment reserved": return "bg-purple-100 text-purple-700";
    case "closed": case "dismissed": return "bg-gray-100 text-gray-600";
    default: return "bg-blue-100 text-blue-700";
  }
};

const priorityBadge = (p: string) => {
  switch (p?.toLowerCase()) {
    case "urgent": case "very_urgent": return "bg-red-100 text-red-700";
    case "high": return "bg-orange-100 text-orange-700";
    default: return "";
  }
};

/* ────────── Component ────────── */
export default function CourtDashboard() {
  const [data, setData] = useState<CourtDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axiosClient.get("/court/dashboard");
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  /* ── Loading Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-16">
        <div className="mb-8">
          <div className="h-10 bg-gray-100 rounded-xl w-80 mb-3 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded-lg w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4" />
              <div className="h-8 bg-gray-100 rounded-lg w-12 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 mb-4 animate-pulse">
              <div className="h-5 bg-gray-100 rounded w-16" />
              <div className="h-5 bg-gray-100 rounded flex-1" />
              <div className="h-5 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error + Retry ── */
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-gray-500">
        <Shield className="w-14 h-14 mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-[#111111] mb-2">Unable to Load Dashboard</h2>
        <p className="mb-6 text-sm">Failed to connect to court services. Please try again.</p>
        <button onClick={fetchDashboard} className="px-6 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-16">

      {/* ═══════ HEADER ═══════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111111] tracking-tight">
            {getGreeting()}, Justice {data.judge.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">Today&apos;s judicial workload overview.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/court/cause-list" className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#111111] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
            Full Cause List
          </Link>
          <Link href="/dashboard/court/orders" className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2 text-sm">
            <Gavel className="w-4 h-4" /> Draft Order
          </Link>
        </div>
      </div>

      {/* ═══════ STATISTICS ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "Listed Today", val: data.stats.cases_listed_today, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Judgments", val: data.stats.pending_judgments, icon: Gavel, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Hearings", val: data.stats.hearings_scheduled, icon: CalIcon, color: "text-red-600", bg: "bg-red-50" },
          { label: "Evidence Queue", val: data.stats.evidence_awaiting, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Urgent Matters", val: data.stats.urgent_matters, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Unread Alerts", val: data.stats.unread_notifications, icon: Bell, color: "text-[#C9971A]", bg: "bg-[#C9971A]/10" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-5 bg-current text-gray-900 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {s.label === "Hearings" && s.val > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <h3 className="text-3xl font-bold text-[#111111] mb-1">{s.val}</h3>
            <p className="text-sm font-bold text-gray-600">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ═══════ TODAY'S PRIORITIES ═══════ */}
      {data.today_priorities.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Today&apos;s Priorities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.today_priorities.map(p => (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  p.urgent ? "bg-red-50/80 border-red-100" : "bg-amber-50/80 border-amber-100"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${p.urgent ? "bg-red-100" : "bg-amber-100"}`}>
                    {p.type === "judgment" && <Gavel className={`w-5 h-5 ${p.urgent ? "text-red-600" : "text-amber-600"}`} />}
                    {p.type === "hearing" && <Clock className={`w-5 h-5 ${p.urgent ? "text-red-600" : "text-amber-600"}`} />}
                    {p.type === "evidence" && <FileText className={`w-5 h-5 ${p.urgent ? "text-red-600" : "text-amber-600"}`} />}
                  </div>
                  {p.urgent && (
                    <span className="text-[10px] font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Urgent</span>
                  )}
                </div>
                <h3 className={`font-bold text-sm ${p.urgent ? "text-red-900" : "text-amber-900"}`}>{p.title}</h3>
                <p className={`text-xs font-semibold mt-1 ${p.urgent ? "text-red-700" : "text-amber-700"}`}>{p.time}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ MAIN GRID ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ─── Left Column (3/4) ─── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Bench Actions */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-5">Bench Actions</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {[
                { name: "Cause List", icon: Briefcase, href: "/dashboard/court/cause-list" },
                { name: "Judicial Note", icon: FileText, href: "/dashboard/court/orders" },
                { name: "Evidence", icon: Eye, href: "/dashboard/court/evidence" },
                { name: "AI Brief", icon: Bot, href: "/dashboard/court/assistant" },
                { name: "Draft Order", icon: Gavel, href: "/dashboard/court/orders" },
                { name: "Schedule", icon: CalIcon, href: "/dashboard/court/calendar" },
              ].map((a, i) => (
                <Link key={i} href={a.href} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-2 group-hover:bg-[#111111] group-hover:border-[#111111] transition-all shadow-sm">
                    <a.icon className="w-6 h-6 text-gray-600 group-hover:text-[#C9971A]" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#111111]">{a.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ═══════ TODAY'S CAUSE LIST ═══════ */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C9971A]" /> Today&apos;s Cause List
              </h2>
              <Link href="/dashboard/court/cause-list" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Full List <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {data.cause_list.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/70">
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Case</th>
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Parties</th>
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {data.cause_list.map(item => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => window.location.href = `/dashboard/court/cases/${item.case_id}`}
                      >
                        <td className="p-4">
                          <div className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{item.courtroom}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111111] line-clamp-1">{item.case_title}</div>
                          <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-1 inline-block">{item.case_id}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-700 font-medium">{item.petitioner || "—"}</div>
                          <div className="text-xs text-gray-400">vs {item.respondent || "—"}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(item.status)}`}>
                            {item.status}
                          </span>
                          {item.priority && item.priority !== "normal" && (
                            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadge(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C9971A]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <CalIcon className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No hearings listed today.</h3>
                <p className="text-gray-500 mt-1">The cause list is clear for today.</p>
              </div>
            )}
          </div>

          {/* ═══════ ASSIGNED CASES ═══════ */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111111]">Assigned Cases</h2>
              <Link href="/dashboard/court/cases" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {data.assigned_cases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/70">
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Case & Parties</th>
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Next Hearing</th>
                      <th className="p-4 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {data.assigned_cases.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => window.location.href = `/dashboard/court/cases/${c.case_id}`}>
                        <td className="p-4">
                          <div className="font-bold text-[#111111] line-clamp-1">{c.title}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{c.case_id}</span>
                            <span>{c.petitioner} vs {c.respondent}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColor(c.status)}`}>{c.status}</span>
                          {c.priority && c.priority !== "normal" && (
                            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityBadge(c.priority)}`}>{c.priority}</span>
                          )}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-700">
                          {c.next_hearing ? new Date(c.next_hearing).toLocaleDateString() : "TBD"}
                        </td>
                        <td className="p-4 text-right">
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#C9971A]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <Briefcase className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No cases assigned yet.</h3>
                <p className="text-gray-500 mt-1">Cases will appear here once assigned by the registry.</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Sidebar (1/4) ─── */}
        <div className="space-y-8">

          {/* AI BENCH BRIEF */}
          <div className="bg-gradient-to-b from-[#111111] to-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#C9971A]/10 rounded-bl-full border-b border-l border-[#C9971A]/20" />
            <h2 className="text-white font-bold text-base mb-5 flex items-center gap-2 relative z-10">
              <Bot className="w-5 h-5 text-[#C9971A]" /> AI Bench Brief
            </h2>
            <div className="space-y-3 relative z-10">
              {data.ai_insights.length > 0 ? data.ai_insights.map(insight => (
                <div key={insight.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {insight.type === "summary" && <BookOpen className="w-4 h-4 text-blue-400" />}
                      {insight.type === "contradiction" && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {insight.type === "precedent" && <Scale className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{insight.title}</h4>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{insight.description}</p>
                      {insight.case_id && (
                        <div className="mt-2 flex items-center text-[#C9971A] text-xs font-bold group-hover:translate-x-1 transition-transform">
                          View Analysis <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-400 text-sm italic">No AI insights generated today.</p>
              )}
            </div>
          </div>

          {/* PENDING ORDERS */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Gavel className="w-4 h-4" /> Pending Orders
            </h2>
            {data.pending_orders.length > 0 ? (
              <div className="space-y-3">
                {data.pending_orders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-bold text-[#111111] line-clamp-1">{order.title || `Order — ${order.case_id}`}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{order.status} • {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No pending orders.</p>
            )}
          </div>

          {/* EVIDENCE REVIEW QUEUE */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Evidence Queue
            </h2>
            {data.evidence_review.length > 0 ? (
              <div className="space-y-3">
                {data.evidence_review.slice(0, 4).map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#111111] line-clamp-1">{ev.file_name || ev.description}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Case {ev.case_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No evidence awaiting review.</p>
            )}
          </div>

          {/* MINI CALENDAR */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <CalIcon className="w-4 h-4" /> Upcoming Schedule
            </h2>
            {data.calendar.length > 0 ? (
              <div className="space-y-3">
                {data.calendar.slice(0, 5).map(cal => (
                  <div key={cal.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="text-center shrink-0">
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{new Date(cal.date).toLocaleDateString(undefined, { month: "short" })}</div>
                      <div className="text-lg font-bold text-[#111111]">{new Date(cal.date).getDate()}</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#111111] line-clamp-1">{cal.case_title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{cal.court}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming hearings.</p>
            )}
          </div>

          {/* NOTIFICATIONS */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</span>
              {data.notifications.filter(n => !n.read).length > 0 && (
                <span className="w-2 h-2 bg-[#C9971A] rounded-full animate-pulse" />
              )}
            </h2>
            {data.notifications.length > 0 ? (
              <div className="space-y-4">
                {data.notifications.slice(0, 4).map(n => (
                  <div key={n.id} className="flex gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.read ? "bg-gray-300" : "bg-[#C9971A]"}`} />
                    <div>
                      <p className={`text-sm leading-snug ${n.read ? "text-gray-600" : "text-[#111111] font-semibold"}`}>{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No notifications.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
