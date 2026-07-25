"use client";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import { 
  Users, Briefcase, Calendar as CalendarIcon, FileEdit, Plus, UploadCloud, 
  BookOpen, Bot, Bell, ChevronRight, Clock, AlertCircle, CheckCircle2,
  FileText, MessageSquare, Video, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PriorityItem {
  id: string;
  title: string;
  type: string;
  time?: string;
  urgent: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  due_date?: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  case_id?: string;
  type: string;
}

interface LawyerDashboardData {
  lawyer: { id: string; name: string; email: string; role: string; };
  stats: {
    active_clients: number;
    active_cases: number;
    hearings_today: number;
    pending_drafts: number;
    unread_notifications: number;
  };
  today_priorities: PriorityItem[];
  active_cases: {
    id: string; case_id: string; title: string; status: string;
    court: string; next_hearing: string | null; priority: string | null; client: string | null;
  }[];
  hearings: {
    id: string; case_id: string; case_title: string; date: string; court: string; judge: string | null;
  }[];
  tasks: TaskItem[];
  recent_activity: { id: string; message: string; created_at: string; read: boolean; }[];
  notifications: { id: string; message: string; created_at: string; read: boolean; }[];
  ai_insights: AIInsight[];
  calendar: any[];
}

export default function LawyerDashboard() {
  const [data, setData] = useState<LawyerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosClient.get("/lawyer/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleTask = (taskId: string) => {
    if (!data) return;
    setData({
      ...data,
      tasks: data.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#C9971A] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
        <h2 className="text-xl font-bold text-[#111111]">Connection Error</h2>
        <p>Failed to load dashboard data. Please refresh.</p>
      </div>
    );
  }

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "closed":
      case "dismissed": return "bg-gray-100 text-gray-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getPriorityIcon = (type: string, urgent: boolean) => {
    switch (type) {
      case 'hearing': return <Clock className={`w-5 h-5 ${urgent ? 'text-red-600' : 'text-orange-600'}`} />;
      case 'evidence': return <AlertCircle className={`w-5 h-5 ${urgent ? 'text-yellow-600' : 'text-blue-600'}`} />;
      case 'draft': return <FileEdit className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-16">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#111111] tracking-tight">
            Good Morning, Advocate {data.lawyer.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">Here's an overview of your legal practice today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/lawyer/clients" className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#111111] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            Clients
          </Link>
          <Link href="/dashboard/lawyer/cases" className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Case
          </Link>
        </div>
      </div>

      {/* Premium Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "Active Clients", val: data.stats.active_clients, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+2 this week" },
          { label: "Active Cases", val: data.stats.active_cases, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Steady" },
          { label: "Hearings Today", val: data.stats.hearings_today, icon: CalendarIcon, color: "text-red-600", bg: "bg-red-50", trend: "Urgent" },
          { label: "Pending Drafts", val: data.stats.pending_drafts, icon: FileEdit, color: "text-purple-600", bg: "bg-purple-50", trend: "3 due soon" },
          { label: "Unread Alerts", val: data.stats.unread_notifications, icon: Bell, color: "text-[#C9971A]", bg: "bg-[#C9971A]/10", trend: "Check inbox" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 bg-current text-[#111111] group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.label === "Hearings Today" && stat.val > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-[#111111] mb-1">{stat.val}</h3>
            <p className="text-sm font-bold text-gray-600">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-2 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* TODAY'S PRIORITIES (The most important section) */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-[#111111] mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Today's Priorities
        </h2>
        {data.today_priorities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.today_priorities.map(priority => (
              <div key={priority.id} className={`p-5 rounded-2xl border flex flex-col justify-between hover:shadow-md transition-all ${
                priority.urgent ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${priority.urgent ? 'bg-red-100' : 'bg-orange-100'}`}>
                    {getPriorityIcon(priority.type, priority.urgent)}
                  </div>
                  {priority.urgent && (
                    <span className="text-[10px] font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Urgent</span>
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-sm line-clamp-2 ${priority.urgent ? 'text-red-900' : 'text-orange-900'}`}>
                    {priority.title}
                  </h3>
                  <p className={`text-xs font-semibold mt-1 ${priority.urgent ? 'text-red-700' : 'text-orange-700'}`}>
                    {priority.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-500 font-medium">No urgent priorities for today. Great job!</p>
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { name: "New Client", icon: Users, href: "/dashboard/lawyer/clients" },
                { name: "Draft Petition", icon: FileEdit, href: "/dashboard/lawyer/cases" },
                { name: "Evidence", icon: UploadCloud, href: "/dashboard/lawyer/evidence" },
                { name: "AI Intel", icon: Bot, href: "/dashboard/lawyer/assistant" },
                { name: "Research", icon: BookOpen, href: "/dashboard/lawyer/research" },
                { name: "Meeting", icon: Video, href: "/dashboard/lawyer/calendar" },
              ].map((action, i) => (
                <Link key={i} href={action.href} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-2 group-hover:bg-[#111111] group-hover:text-[#C9971A] group-hover:border-[#111111] transition-all shadow-sm">
                    <action.icon className="w-6 h-6 text-gray-600 group-hover:text-[#C9971A]" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 group-hover:text-[#111111] transition-colors">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Cases */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111111]">Active Cases</h2>
              <Link href="/dashboard/lawyer/cases" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {data.active_cases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Case & Client</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status & Priority</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Next Hearing</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {data.active_cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/lawyer/cases/${c.case_id}`}>
                        <td className="p-4">
                          <div className="font-bold text-[#111111] line-clamp-1">{c.title}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{c.case_id}</span>
                            <span>{c.client}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(c.status)}`}>
                              {c.status}
                            </span>
                            {c.priority && c.priority !== 'normal' && (
                              <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                {c.priority}
                              </span>
                            )}
                          </div>
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
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <Briefcase className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No active cases assigned.</h3>
                <p className="mt-1 mb-6">Start by registering your first client or case.</p>
                <Link href="/dashboard/lawyer/cases" className="px-6 py-2 bg-[#111111] text-white rounded-xl font-bold hover:bg-gray-800">
                  Create Case
                </Link>
              </div>
            )}
          </div>

          {/* Today's Hearings List */}
          {data.hearings.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#C9971A]" /> Today's Hearings
                </h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {data.hearings.map((h) => (
                  <div key={h.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">{h.case_id}</span>
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#111111] text-lg">{h.case_title}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{h.court} • {h.judge}</p>
                    </div>
                    <Link href={`/dashboard/lawyer/cases/${h.case_id}`} className="shrink-0 px-5 py-2.5 bg-gray-100 rounded-xl text-sm font-bold text-[#111111] hover:bg-gray-200 transition-colors">
                      View Case
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          
          {/* AI Insights - Proactive Alerts */}
          <div className="bg-gradient-to-b from-[#111111] to-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9971A]/10 rounded-bl-full border-b border-l border-[#C9971A]/20"></div>
            <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
              <Bot className="w-5 h-5 text-[#C9971A]" /> AI Intelligence
            </h2>
            
            <div className="space-y-4 relative z-10">
              {data.ai_insights.length > 0 ? (
                data.ai_insights.map(insight => (
                  <div key={insight.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {insight.type === 'missing_document' && <FileText className="w-4 h-4 text-yellow-400" />}
                        {insight.type === 'contradiction' && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {insight.type === 'precedent' && <BookOpen className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1">{insight.title}</h4>
                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">{insight.description}</p>
                        {insight.case_id && (
                          <div className="mt-3 flex items-center text-[#C9971A] text-xs font-bold group-hover:translate-x-1 transition-transform">
                            View Case {insight.case_id} <ArrowRight className="w-3 h-3 ml-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">No insights generated today. All cases look optimal.</p>
              )}
            </div>
          </div>

          {/* Productivity Tasks */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">My Tasks</h2>
              <button className="text-gray-400 hover:text-[#111111]"><Plus className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1">
              <AnimatePresence>
                {data.tasks.map(task => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer group transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-[#C9971A] transition-colors"></div>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-all ${task.completed ? 'text-gray-400 line-through' : 'text-[#111111]'}`}>
                        {task.title}
                      </p>
                      {task.due_date && !task.completed && (
                        <p className="text-xs text-red-500 font-semibold mt-1">Due {task.due_date}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent Client Activity */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center justify-between">
              Recent Activity
              {data.recent_activity.filter(a => !a.read).length > 0 && (
                <span className="w-2 h-2 bg-[#C9971A] rounded-full animate-pulse"></span>
              )}
            </h2>
            <div className="space-y-5">
              {data.recent_activity.slice(0, 4).map(activity => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 shrink-0 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111] leading-snug">{activity.message}</p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">{new Date(activity.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {data.recent_activity.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
