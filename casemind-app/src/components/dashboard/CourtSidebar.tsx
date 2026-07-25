"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  Briefcase,
  Calendar,
  Bell,
  Bot,
  User,
  Settings,
  LogOut,
  Gavel,
  FileText,
  Shield,
} from "lucide-react";
import { removeToken } from "@/lib/api";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard/court", icon: LayoutDashboard },
  { name: "Cause List", href: "/dashboard/court/cause-list", icon: ListOrdered },
  { name: "Assigned Cases", href: "/dashboard/court/cases", icon: Briefcase },
  { name: "Hearings", href: "/dashboard/court/hearings", icon: Calendar },
  { name: "Orders & Judgments", href: "/dashboard/court/orders", icon: Gavel },
  { name: "Evidence Review", href: "/dashboard/court/evidence", icon: FileText },
  { name: "AI Bench Brief", href: "/dashboard/court/assistant", icon: Bot },
  { name: "Calendar", href: "/dashboard/court/calendar", icon: Calendar },
  { name: "Notifications", href: "/dashboard/court/notifications", icon: Bell },
];

const bottomItems = [
  { name: "Profile", href: "/dashboard/court/profile", icon: User },
  { name: "Settings", href: "/dashboard/court/settings", icon: Settings },
];

export default function CourtSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/auth");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed top-0 left-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#C9971A]" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-[#111111]">
              CaseMind
            </span>
            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em] -mt-1">
              Judicial OS
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2 px-2">
          Judicial Workspace
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/court"
              ? pathname === "/dashboard/court"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#111111] text-white shadow-md shadow-gray-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111111]"
              }`}
            >
              <item.icon
                className={`w-[18px] h-[18px] ${isActive ? "text-[#C9971A]" : ""}`}
              />
              <span className="font-medium text-[13px]">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-[#E5E7EB] flex flex-col gap-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gray-100 text-[#111111]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111111]"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-medium text-[13px]">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-left mt-2"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="font-medium text-[13px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
