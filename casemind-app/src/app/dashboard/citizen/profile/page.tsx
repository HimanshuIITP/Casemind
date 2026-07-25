"use client";

import { User, Mail, Shield, Key } from "lucide-react";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";

export default function ProfilePage() {
  const [user, setUser] = useState<{full_name: string, email: string, phone?: string, role: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await axiosClient.get("/auth/me");
        if (res.data.user) {
          setUser({
            full_name: res.data.user.full_name || res.data.user.name || "User",
            email: res.data.user.email || "",
            phone: res.data.user.phone || "Not provided",
            role: res.data.user.role || "citizen"
          });
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-8">Loading Profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#111111]">My Profile</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your personal information and security.</p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111111]">{user?.full_name}</h2>
              <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9971A]/10 text-[#C9971A] rounded-full text-sm font-semibold capitalize">
                <Shield className="w-4 h-4" /> {user?.role} Account
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <h3 className="text-lg font-bold text-[#111111] mb-4">Personal Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input type="text" disabled defaultValue={user?.full_name} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input type="email" disabled defaultValue={user?.email} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <input type="text" disabled defaultValue={user?.phone} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Aadhaar / ID Number</label>
              <input type="password" disabled defaultValue="••••••••••••" className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-gray-600" />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E7EB]">
            <button className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
              Request Info Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
