"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash2, Info, AlertCircle, FileText } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const data = await apiFetch("/notifications");
      setNotifications(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setMarkingAll(true);
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err: any) {
      alert(`Failed to mark as read: ${err.message}`);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err: any) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      console.error(err);
    }
  }

  function getIcon(type: string) {
    switch(type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'update': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-[#C9971A]" />;
    }
  }

  if (loading && notifications.length === 0) return <div>Loading...</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
            Notifications 
            {unreadCount > 0 && (
              <span className="bg-[#C9971A] text-white text-sm px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Stay updated on your cases and hearings.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50">
        <ul className="divide-y divide-[#E5E7EB]">
          {notifications.length === 0 ? (
            <li className="py-16 text-center">
              <div className="flex flex-col items-center text-gray-400">
                <Bell className="w-12 h-12 mb-3" />
                <p className="text-[#111111] font-medium text-lg">You're all caught up!</p>
                <p className="text-sm">No new notifications.</p>
              </div>
            </li>
          ) : (
            notifications.map((notif) => (
              <li 
                key={notif.id} 
                className={`p-6 flex gap-4 transition-colors group ${notif.is_read ? 'bg-white' : 'bg-[#C9971A]/5'}`}
                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-gray-100' : 'bg-white shadow-sm border border-[#C9971A]/20'}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className={`text-base font-medium ${notif.is_read ? 'text-gray-800' : 'text-[#111111] font-bold'}`}>
                        {notif.title}
                      </h3>
                      <p className={`text-sm mt-1 ${notif.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
