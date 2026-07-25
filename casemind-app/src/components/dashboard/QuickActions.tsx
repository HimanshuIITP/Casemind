import { FileText, Upload, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    title: "File New Petition",
    description: "Start a new legal case",
    icon: FileText,
    href: "/dashboard/citizen/file",
    primary: true,
  },
  {
    title: "Upload Evidence",
    description: "Add documents to existing case",
    icon: Upload,
    href: "/dashboard/citizen/documents/new",
  },
  {
    title: "Track Case",
    description: "Check status of active matters",
    icon: MapPin,
    href: "/dashboard/citizen/cases",
  },
  {
    title: "Ask CaseMind AI",
    description: "Get instant legal insights",
    icon: Sparkles,
    href: "/dashboard/citizen/assistant",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
            action.primary
              ? "bg-[#111111] text-white border-[#111111] shadow-lg shadow-gray-300/50"
              : "bg-white border-[#E5E7EB] hover:border-gray-300 hover:shadow-md"
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            action.primary ? "bg-white/10 text-white" : "bg-gray-50 text-[#111111] border border-gray-100"
          }`}>
            <action.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`font-semibold mb-1 ${action.primary ? "text-white" : "text-[#111111]"}`}>
              {action.title}
            </h4>
            <p className={`text-sm ${action.primary ? "text-gray-300" : "text-gray-500"}`}>
              {action.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
