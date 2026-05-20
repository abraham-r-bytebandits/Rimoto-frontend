"use client";

import { useState } from "react";
import {
  Star,
  ShieldCheck,
  Loader2,
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
import type { Ride, TabId } from "./types";

// ─── Published Tab ────────────────────────────────────────────────────────────

export function PublishedTab({
  approvedRides,
  setActiveTab,
  onAction,
}: {
  approvedRides: Ride[];
  setActiveTab: (t: TabId) => void;
  onAction?: (id: string, action: "APPROVE" | "REJECT") => Promise<void>;
}) {
  const [filter, setFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!onAction) return;
    setActionLoading(`${action}-${id}`);
    await onAction(id, action);
    setActionLoading(null);
  };

  const filtered = approvedRides.filter((r) =>
    r.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search published rides..."
        className="mb-6 max-w-md"
      />
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 pl-6">Ride</TableHead>
                <TableHead className="font-semibold text-gray-900">Route</TableHead>
                <TableHead className="font-semibold text-gray-900">Date</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Featured</TableHead>
                <TableHead className="font-semibold text-gray-900">WA Joins</TableHead>
                <TableHead className="font-semibold text-right text-gray-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    No published rides found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ride) => (
                  <TableRow key={ride.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900 pl-6">{ride.title}</TableCell>
                    <TableCell className="text-gray-600">{ride.startLocation} &rarr; {ride.endLocation}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(ride.dateScheduled).toLocaleDateString()}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" /> Live
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {ride.featuredSlot ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider">
                          <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {ride.featuredSlot.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{ride.whatsappJoinsCount}</TableCell>
                    <TableCell className="text-right pr-6 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveTab("featured")}
                          className="inline-flex items-center justify-center rounded-md text-sm font-semibold border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors gap-1.5"
                        >
                          <Star className="h-4 w-4 text-amber-500 fill-current" /> Feature
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleAction(ride.id, "REJECT")}
                          className="inline-flex items-center justify-center rounded-md text-sm font-semibold bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-colors border border-red-100 gap-1.5"
                        >
                          {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          Unpublish
                        </button>
                      </div>
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
