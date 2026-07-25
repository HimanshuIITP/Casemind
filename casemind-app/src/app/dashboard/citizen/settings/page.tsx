import { Bell, Lock, Globe, Moon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-[#111111]">Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your app preferences and notification configurations.</p>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-[#E5E7EB]">
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Push Notifications</h3>
                <p className="text-gray-500 text-sm mt-1">Receive alerts for upcoming hearings and case updates.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9971A]"></div>
            </label>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Language Preference</h3>
                <p className="text-gray-500 text-sm mt-1">Choose your preferred language for the interface.</p>
              </div>
            </div>
            <select className="bg-gray-50 border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#C9971A]">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Dark Mode</h3>
                <p className="text-gray-500 text-sm mt-1">Toggle dark appearance for low-light environments.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9971A]"></div>
            </label>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-bg-gray-50/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Two-Factor Authentication</h3>
                <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Enable 2FA
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
