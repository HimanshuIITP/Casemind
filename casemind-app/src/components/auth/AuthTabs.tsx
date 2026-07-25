import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
}

interface AuthTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function AuthTabs({ tabs, activeTab, onChange }: AuthTabsProps) {
  return (
    <div className="flex space-x-1 p-1 bg-gray-100/50 rounded-xl mb-8 border border-gray-200/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 py-2 text-sm font-medium rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#C9971A] ${
            activeTab === tab.id
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="auth-tab-bubble"
              className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-200/50"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
