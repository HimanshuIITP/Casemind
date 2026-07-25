"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FolderOpen, 
  Calendar, 
  Bell, 
  Bot, 
  User, 
  Settings, 
  LogOut,
  Search,
  BookOpen
} from "lucide-react";
import { removeToken } from "@/lib/api";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard/lawyer", icon: LayoutDashboard },
  { name: "My Clients", href: "/dashboard/lawyer/clients", icon: Users },
  { name: "Assigned Cases", href: "/dashboard/lawyer/cases", icon: Briefcase },
  { name: "Evidence", href: "/dashboard/lawyer/evidence", icon: FolderOpen },
  { name: "Legal Research", href: "/dashboard/lawyer/research", icon: BookOpen },
  { name: "AI Assistant", href: "/dashboard/lawyer/assistant", icon: Bot },
  { name: "Calendar", href: "/dashboard/lawyer/calendar", icon: Calendar },
  { name: "Notifications", href: "/dashboard/lawyer/notifications", icon: Bell },
];

const bottomItems = [
  { name: "Profile", href: "/dashboard/lawyer/profile", icon: User },
  { name: "Settings", href: "/dashboard/lawyer/settings", icon: Settings },
];

export default function LawyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push("/auth");
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[#C9971A] rounded-sm transform rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#111111]">
            CaseMind
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#111111] text-white shadow-md shadow-gray-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#111111]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-[#C9971A]" : ""}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>

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
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-left mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
