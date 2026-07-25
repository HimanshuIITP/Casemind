import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm shadow-gray-200/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-[#111111]">{value}</h3>
          {trend && (
            <p className="text-sm font-medium text-green-600 mt-2">{trend}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
          <Icon className="w-6 h-6 text-[#111111]" />
        </div>
      </div>
    </div>
  );
}
