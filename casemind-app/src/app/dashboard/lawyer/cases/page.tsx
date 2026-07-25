"use client";

import { useState, useEffect, useMemo } from "react";
import axiosClient from "@/lib/axiosClient";
import Link from "next/link";
import { 
  Briefcase, 
  Search, 
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  ColumnDef
} from "@tanstack/react-table";

interface Case {
  id: string;
  case_id: string;
  title: string;
  description: string;
  court: string;
  status: string;
  priority: string;
  next_hearing_date: string | null;
  client_name: string | null;
}

export default function LawyerCasesPage() {
  const [data, setData] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Server-side pagination & filtering state
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const res = await axiosClient.get(`/lawyer/cases?${params.toString()}`);
      setData(res.data.items);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, search, statusFilter, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
      case "very_urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
      case "dismissed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const columns = useMemo<ColumnDef<Case>[]>(() => [
    {
      accessorKey: "case_id",
      header: "Case ID",
      cell: info => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">{info.getValue() as string || "Draft"}</span>
    },
    {
      accessorKey: "title",
      header: "Title & Client",
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-[#111111] line-clamp-1">{row.original.title}</div>
          <div className="text-sm text-gray-500">{row.original.client_name || "Unknown Client"}</div>
        </div>
      )
    },
    {
      accessorKey: "court",
      header: "Court",
      cell: info => <div className="text-sm font-medium text-gray-700">{info.getValue() as string}</div>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const val = info.getValue() as string;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(val)}`}>
            {val}
          </span>
        )
      }
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: info => {
        const val = info.getValue() as string;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(val)}`}>
            {val.replace("_", " ")}
          </span>
        )
      }
    },
    {
      accessorKey: "next_hearing_date",
      header: "Next Hearing",
      cell: info => {
        const val = info.getValue() as string;
        return <div className="text-sm font-medium text-gray-700">{val ? new Date(val).toLocaleDateString() : "Not Scheduled"}</div>
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Link href={`/dashboard/lawyer/cases/${row.original.id}`} className="px-3 py-1.5 bg-[#111111] text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-[#C9971A]" /> Assigned Cases
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage and track your active legal matters.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Open New Case
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases by title or ID..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1); // reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#C9971A] focus:ring-1 focus:ring-[#C9971A]"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#C9971A] text-sm font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <select 
            value={priorityFilter} 
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#C9971A] text-sm font-medium"
          >
            <option value="">All Priorities</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-[#E5E7EB]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-12 text-center text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-lg text-gray-700">No cases found.</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page <span className="font-bold text-[#111111]">{page}</span> of{" "}
            <span className="font-bold text-[#111111]">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
