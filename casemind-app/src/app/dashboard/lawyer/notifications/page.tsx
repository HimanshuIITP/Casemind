"use client";

import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { formatDistanceToNow, parseISO } from "date-fns";
import { 
  Bell, 
  Check,
  CheckCircle2,
  Trash2,
  AlertCircle
} from "lucide-react";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function LawyerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get("/lawyer/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await axiosClient.put(`/lawyer/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.put("/lawyer/notifications/read-all");
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosClient.delete(`/lawyer/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
            <div className="p-3 bg-[#C9971A]/10 rounded-xl">
              <Bell className="w-6 h-6 text-[#C9971A]" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-3 py-1 bg-red-100 text-red-600 rounded-full font-bold ml-2">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-2 ml-14">Stay updated on your cases, hearings, and client activities.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:text-[#C9971A] hover:border-[#C9971A] transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications Inbox */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#C9971A] rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">You're all caught up!</h3>
            <p className="text-gray-500 mt-2 max-w-sm">There are no new notifications or alerts for your account right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-6 transition-colors flex items-start gap-4 group ${
                  notification.is_read ? 'bg-white' : 'bg-[#C9971A]/[0.02]'
                }`}
              >
                {/* Status Indicator */}
                <div className="mt-1">
                  {notification.is_read ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C9971A] ring-4 ring-[#C9971A]/20"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <p className={`text-base ${notification.is_read ? 'text-gray-600' : 'text-[#111111] font-bold'}`}>
                      {notification.message}
                    </p>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(parseISO(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {/* Actions (Visible on Hover) */}
                  <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#C9971A] transition-colors"
                      >
                        <Check className="w-4 h-4" /> Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
