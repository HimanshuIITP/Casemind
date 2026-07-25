"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, FileText, ChevronLeft, ChevronLast, ChevronFirst } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

type Case = {
  id: string;
  case_id: string;
  title: string;
  court: string;
  status: string;
  priority: string;
  updated_at: string;
  next_hearing_date: string | null;
};

const columnHelper = createColumnHelper<Case>();

export default function CasesPage() {
  const router = useRouter();
  
  // Data State
  const [data, setData] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter(searchInput);
      setPagination(prev => ({ ...prev, pageIndex: 0 })); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch Data
  useEffect(() => {
    let isMounted = true;
    async function fetchCases() {
      try {
        setLoading(true);
        const res = await axiosClient.get("/cases", {
          params: {
            page: pagination.pageIndex + 1,
            size: pagination.pageSize,
            search: globalFilter || undefined,
          }
        });
        if (isMounted) {
          setData(res.data.items || []);
          setTotal(res.data.total || 0);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || "Failed to fetch cases");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchCases();
    return () => { isMounted = false; };
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  // Columns definition
  const columns = useMemo(() => [
    columnHelper.accessor("case_id", {
      header: "Case ID",
      cell: info => <span className="font-bold text-[#111111]">{info.getValue()}</span>,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: info => <span className="text-gray-600 font-medium line-clamp-1">{info.getValue()}</span>,
    }),
    columnHelper.accessor("court", {
      header: "Court",
      cell: info => <span className="text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: info => {
        const val = info.getValue().toLowerCase();
        let classes = "bg-gray-100 text-gray-800";
        if (val === "active") classes = "bg-green-100 text-green-800";
        if (val === "pending") classes = "bg-yellow-100 text-yellow-800";
        if (val === "closed") classes = "bg-gray-100 text-gray-500";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${classes}`}>
            {val}
          </span>
        );
      },
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: info => {
        const val = info.getValue().toLowerCase();
        let classes = "bg-gray-100 text-gray-800";
        if (val === "high") classes = "bg-red-100 text-red-800";
        if (val === "medium") classes = "bg-orange-100 text-orange-800";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${classes}`}>
            {val}
          </span>
        );
      },
    }),
    columnHelper.accessor("next_hearing_date", {
      header: "Next Hearing",
      cell: info => {
        const val = info.getValue();
        return val ? <span className="text-[#111111] font-medium">{new Date(val).toLocaleDateString()}</span> : <span className="text-gray-400 italic">N/A</span>;
      },
    }),
    columnHelper.accessor("updated_at", {
      header: "Last Updated",
      cell: info => <span className="text-gray-500">{new Date(info.getValue()).toLocaleDateString()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button 
          className="p-1 text-gray-400 group-hover:text-[#111111] transition-colors rounded-lg hover:bg-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      ),
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
            My Cases
            <span className="bg-gray-100 text-gray-600 text-sm px-2.5 py-0.5 rounded-full font-bold">
              {total} Total
            </span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage and track all your legal matters.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full md:w-64 bg-white border border-[#E5E7EB] rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-[#C9971A] focus:ring-1 focus:ring-[#C9971A] transition-colors shadow-sm"
            />
          </div>
          <button className="p-2 border border-[#E5E7EB] rounded-xl bg-white text-gray-600 hover:text-[#111111] hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold">&times;</button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm shadow-gray-200/50 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50/50 border-b border-[#E5E7EB]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                // Loading Skeleton
                Array.from({ length: pagination.pageSize }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-6"></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <FileText className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="text-[#111111] font-bold text-xl mb-1">No cases found</p>
                      <p className="text-sm text-gray-500 max-w-sm mb-6">
                        {globalFilter 
                          ? `We couldn't find any cases matching "${globalFilter}". Try adjusting your search.`
                          : "You haven't filed or been assigned to any legal matters yet."}
                      </p>
                      {!globalFilter && (
                        <Link href="/dashboard/citizen/file" className="px-6 py-2.5 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shadow-md">
                          File a Petition
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/dashboard/citizen/cases/${row.original.case_id}`)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-4 px-6 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="border-t border-[#E5E7EB] bg-gray-50/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 font-medium">
            Showing {loading ? '-' : table.getRowModel().rows.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0} to {loading ? '-' : Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of {loading ? '-' : total} entries
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
              className="bg-white border border-[#E5E7EB] rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:border-[#C9971A] font-medium text-gray-600 cursor-pointer"
            >
              {[10, 20, 30, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage() || loading}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:bg-gray-50 hover:text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronFirst className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || loading}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:bg-gray-50 hover:text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-3">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || loading}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:bg-gray-50 hover:text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage() || loading}
                className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-gray-500 hover:bg-gray-50 hover:text-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLast className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
