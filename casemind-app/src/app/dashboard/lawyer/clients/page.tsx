"use client";

import { useState, useEffect, useMemo } from "react";
import axiosClient from "@/lib/axiosClient";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from "lucide-react";
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  cases_count: number;
  recent_activity: string | null;
}

const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  status: z.enum(["Active", "Inactive"]),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function ClientsPage() {
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "", email: "", phone: "", status: "Active"
    }
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/lawyer/clients");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset({ name: client.name, email: client.email, phone: client.phone, status: client.status as "Active" | "Inactive" });
    } else {
      setEditingClient(null);
      reset({ name: "", email: "", phone: "", status: "Active" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const onSubmit = async (formData: ClientFormData) => {
    try {
      if (editingClient) {
        await axiosClient.put(`/lawyer/clients/${editingClient.id}`, formData);
      } else {
        await axiosClient.post("/lawyer/clients", formData);
      }
      closeModal();
      fetchClients();
    } catch (err) {
      console.error("Failed to save client", err);
      alert("An error occurred while saving the client.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        await axiosClient.delete(`/lawyer/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error("Failed to delete client", err);
      }
    }
  };

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: info => (
        <div className="font-bold text-[#111111]">{info.getValue() as string}</div>
      )
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-800 font-medium">{row.original.email}</div>
          <div className="text-gray-500">{row.original.phone}</div>
        </div>
      )
    },
    {
      accessorKey: "cases_count",
      header: "Cases",
      cell: info => (
        <div className="font-bold text-[#C9971A] bg-[#C9971A]/10 px-2 py-1 rounded w-fit text-xs">
          {info.getValue() as number} Cases
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const val = info.getValue() as string;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            val === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {val}
          </span>
        )
      }
    },
    {
      accessorKey: "recent_activity",
      header: "Recent Activity",
      cell: info => (
        <div className="text-sm text-gray-500">{info.getValue() as string || "No activity"}</div>
      )
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/lawyer/clients/${row.original.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
          <button onClick={() => openModal(row.original)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.original.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#C9971A]" /> My Clients
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage your client directory and contact information.</p>
        </div>
        <button onClick={() => openModal()} className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, email or phone..."
              value={globalFilter ?? ""}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#C9971A] focus:ring-1 focus:ring-[#C9971A]"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-[#E5E7EB]">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                  <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page <span className="font-bold text-[#111111]">{table.getState().pagination.pageIndex + 1}</span> of{" "}
            <span className="font-bold text-[#111111]">{table.getPageCount() || 1}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 bg-white border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#111111]">
                {editingClient ? "Edit Client" : "Add New Client"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Client Name *</label>
                <input {...register("name")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                <input type="email" {...register("email")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                <input {...register("phone")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                {errors.phone && <p className="text-red-500 text-xs font-medium">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select {...register("status")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#C9971A] text-white font-bold rounded-xl hover:bg-[#b08517] disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
