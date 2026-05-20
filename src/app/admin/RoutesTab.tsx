"use client";

import React, { useState } from "react";
import {
  Trash2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Routes Tab ───────────────────────────────────────────────────────────────

export function RoutesTab({
  popularRoutes = [],
  onAction
}: {
  popularRoutes?: any[];
  onAction?: (action: "CREATE" | "DELETE", payload?: any) => Promise<void>;
}) {
  const [form, setForm] = useState({ orderNo: '', title: '', place: '', iframeUrl: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAction) return;
    setLoading(true);
    await onAction("CREATE", form);
    setForm({ orderNo: '', title: '', place: '', iframeUrl: '' });
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?") && onAction) {
      await onAction("DELETE", { id });
    }
  };

  return (
    <div className="space-y-8">
      {/* Route Form Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Add New Popular Route</h3>
          <p className="text-sm text-gray-500 mt-1">Configure maps and metadata for key community routes</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Order Number</label>
                <Input
                  placeholder="e.g. 1"
                  type="number"
                  required
                  value={form.orderNo}
                  onChange={e => setForm({ ...form, orderNo: e.target.value })}
                  className="h-11 rounded-lg border-gray-300"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Title</label>
                <Input
                  placeholder="e.g. ECR Ride"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="h-11 rounded-lg border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Place description</label>
              <Input
                placeholder="e.g. Chennai → Mahabalipuram"
                required
                value={form.place}
                onChange={e => setForm({ ...form, place: e.target.value })}
                className="h-11 rounded-lg border-gray-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Google Map Iframe HTML</label>
              <Input
                placeholder="Paste full <iframe> tag..."
                required
                value={form.iframeUrl}
                onChange={e => setForm({ ...form, iframeUrl: e.target.value })}
                className="h-11 rounded-lg border-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="self-start inline-flex items-center justify-center rounded-lg text-sm font-bold bg-[#D4E048] px-6 py-3 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-all shadow-sm uppercase tracking-wider"
            >
              {loading ? "Adding..." : "Add Route"}
            </button>
          </form>
        </div>
      </div>

      {/* Routes Table Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 pl-6">Order</TableHead>
                <TableHead className="font-semibold text-gray-900">Title</TableHead>
                <TableHead className="font-semibold text-gray-900">Place</TableHead>
                <TableHead className="font-semibold text-gray-900">Map Link</TableHead>
                <TableHead className="font-semibold text-right text-gray-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {popularRoutes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                    No routes configured
                  </TableCell>
                </TableRow>
              ) : (
                popularRoutes.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="font-bold text-gray-900 pl-6">{r.orderNo}</TableCell>
                    <TableCell className="font-medium text-gray-900">{r.title}</TableCell>
                    <TableCell className="text-gray-600">{r.place}</TableCell>
                    <TableCell className="text-sm text-gray-400 truncate max-w-[200px]">{r.iframeUrl}</TableCell>
                    <TableCell className="text-right pr-6 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-semibold bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-colors border border-red-100 gap-1.5"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
