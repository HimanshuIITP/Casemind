"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/api";
import axiosClient from "@/lib/axiosClient";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await axiosClient.get("/auth/me");
        if (res.data.user) {
          setUser({
            name: res.data.user.full_name || res.data.user.name || "User",
            role: res.data.user.role || "Citizen"
          });
        }
      } catch (err) {
        console.error("Failed to load user for navbar", err);
      }
    }
    loadUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push("/auth");
  };

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#C9971A] transition-colors" />
          <input
            type="text"
            placeholder="Search cases, documents, or hearings..."
            className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9971A]/20 focus:border-[#C9971A] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:text-[#111111] hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9971A] rounded-full border-2 border-white"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#111111] text-[#C9971A] flex items-center justify-center font-semibold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-[#111111] leading-none mb-1">
                {user?.name || "Loading..."}
              </div>
              <div className="text-xs text-gray-500 leading-none capitalize">
                {user?.role || ""}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg shadow-gray-200/50 py-1 overflow-hidden">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#111111]">
                View Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#111111]">
                Account Settings
              </button>
              <div className="h-px bg-[#E5E7EB] my-1" />
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
