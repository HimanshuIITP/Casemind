import Link from "next/link";
import { ChevronRight } from "lucide-react";

const cases = [
  { id: "CM-1021", title: "Property Dispute", status: "Pending", court: "Jammu District Court", date: "21 Aug" },
  { id: "CM-998", title: "Consumer Complaint", status: "Closed", court: "Consumer Forum", date: "Closed" },
  { id: "CM-945", title: "Contract Breach", status: "Active", court: "High Court J&K", date: "05 Sep" },
];

export default function RecentCasesTable() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50">
      <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <h3 className="font-bold text-lg text-[#111111]">Recent Cases</h3>
        <Link href="/dashboard/citizen/cases" className="text-sm font-medium text-gray-500 hover:text-[#111111] transition-colors">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Court</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Hearing</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                <td className="py-4 px-6 text-sm font-medium text-[#111111]">{c.id}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{c.title}</td>
                <td className="py-4 px-6 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    c.status === "Active" ? "bg-green-100 text-green-800" :
                    c.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">{c.court}</td>
                <td className="py-4 px-6 text-sm font-medium text-gray-700">{c.date}</td>
                <td className="py-4 px-6 text-right">
                  <Link href={`/dashboard/citizen/cases/${c.id}`} className="inline-block p-1 text-gray-400 group-hover:text-[#111111] transition-colors rounded-lg hover:bg-gray-200">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
