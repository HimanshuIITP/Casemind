import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function CitizenDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
