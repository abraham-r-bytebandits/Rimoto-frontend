"use client";

import { useState } from "react";
import {
  X,
  Check,
  Activity,
  Eye,
  Trophy,
  Pencil,
  Loader2,
} from "lucide-react";
import { FaClock, FaCheckCircle, FaUsers, FaBookOpen } from "react-icons/fa";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Ride, Metrics, Activity as ActivityType, TabId } from "./types";
import { SkillBadge } from "./page";

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

export function DashboardTab({
  metrics,
  pendingRides,
  approvedRides,
  activities,
  setActiveTab,
  setSelectedRide,
  onAction,
}: {
  metrics: Metrics;
  pendingRides: Ride[];
  approvedRides: Ride[];
  activities: ActivityType[];
  setActiveTab: (t: TabId) => void;
  setSelectedRide: (r: Ride) => void;
  onAction?: (id: string, action: "APPROVE" | "REJECT") => Promise<void>;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDashAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!onAction) return;
    setActionLoading(`${action}-${id}`);
    await onAction(id, action);
    setActionLoading(null);
  };

  const stats = [
    { label: "Pending Rides", value: metrics.pendingRides, icon: FaClock, bgClass: "bg-[#D4E048]/2 border border-[#D4E048]/30", textClass: "text-gray-900", labelClass: "text-gray-700", iconClass: "text-[#a5b030] opacity-10" },
    { label: "Published Rides", value: metrics.publishedRides, icon: FaCheckCircle, bgClass: "bg-[#D4E048]/15 border border-[#D4E048]/30", textClass: "text-gray-900", labelClass: "text-gray-700", iconClass: "text-[#a5b030] opacity-15" },
    { label: "Total Riders", value: metrics.totalRiders, icon: FaUsers, bgClass: "bg-[#D4E048]/2 border border-[#D4E048]/30", textClass: "text-gray-900", labelClass: "text-gray-700", iconClass: "text-[#a5b030] opacity-10" },
    { label: "Stories Pending", value: metrics.pendingStories, icon: FaBookOpen, bgClass: "bg-[#D4E048]/15 border border-[#D4E048]/30", textClass: "text-gray-900", labelClass: "text-gray-700", iconClass: "text-[#a5b030] opacity-15" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={cn(
              "relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200",
              s.bgClass
            )}>
              <div className="px-6 py-6 relative z-10 flex flex-col justify-between h-full min-h-[140px]">
                <h3 className={cn("text-sm font-semibold tracking-wide mb-1", s.labelClass)}>{s.label}</h3>
                <div className={cn("text-5xl font-extrabold", s.textClass)}>{s.value}</div>
              </div>
              <div className={cn("absolute right-[-10%] top-1/2 -translate-y-1/2 z-0", s.iconClass)}>
                <Icon className="w-32 h-32" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Rides */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pending Submissions</h2>
            <p className="text-sm text-gray-500 mt-1">Review and approve new ride requests</p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full bg-[#D4E048]/20 px-3 py-1 text-sm font-medium text-gray-900 ring-1 ring-inset ring-[#D4E048]/40">
            {pendingRides.length} awaiting
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow>
                <TableHead className="font-semibold text-gray-900">Ride</TableHead>
                <TableHead className="font-semibold text-gray-900">Route</TableHead>
                <TableHead className="font-semibold text-gray-900">Date</TableHead>
                <TableHead className="font-semibold text-gray-900">Organizer</TableHead>
                <TableHead className="font-semibold text-gray-900">Skill</TableHead>
                <TableHead className="font-semibold text-right text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {pendingRides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-gray-500">
                    No pending submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                pendingRides.slice(0, 4).map((ride) => (
                  <TableRow key={ride.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900">{ride.title}</TableCell>
                    <TableCell className="text-gray-600">{ride.startLocation} &rarr; {ride.endLocation}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(ride.dateScheduled).toLocaleDateString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{ride.organizer.firstName} {ride.organizer.lastName}</TableCell>
                    <TableCell className="whitespace-nowrap"><SkillBadge level={ride.skillLevel} /></TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedRide(ride)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1.5" /> View
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDashAction(ride.id, "APPROVE")}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#D4E048] px-3 py-1.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === `APPROVE-${ride.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                          disabled={!!actionLoading}
                          onClick={() => handleDashAction(ride.id, "REJECT")}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-50 px-3 py-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500 mt-1">Latest platform events</p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              {activities.length} events
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Activity className="h-8 w-8 mb-3 opacity-20" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <div key={a.id} className="flex gap-4 py-4">
                    <div className={cn(
                      "w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 shadow-sm",
                      a.actionSeverity === "SUCCESS" ? "bg-green-500 shadow-green-200" :
                        a.actionSeverity === "WARNING" ? "bg-amber-500 shadow-amber-200" :
                          "bg-gray-400 shadow-gray-200"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{a.message}</p>
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero Banner */}
        {(() => {
          const heroBanner = approvedRides.find(r => r.featuredSlot === "HERO_BANNER");
          return (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col h-[400px]">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content Management</p>
                  <h2 className="text-lg font-bold text-gray-900">Hero Banner</h2>
                </div>
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                  heroBanner ? "bg-[#D4E048]/20 text-gray-900 ring-1 ring-inset ring-[#D4E048]/40" : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20"
                )}>
                  {heroBanner ? "Active" : "Not Set"}
                </span>
              </div>
              <div className="flex-1 p-0 flex flex-col relative bg-gray-50">
                {heroBanner ? (
                  <div className="relative w-full h-full overflow-hidden flex flex-col justify-end">
                    {heroBanner.imageUrls?.length > 0 ? (
                      <img
                        src={heroBanner.imageUrls[0].replace(/['"]/g, '')}
                        crossOrigin="anonymous"
                        alt={heroBanner.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="relative z-10 p-6">
                      <span className="inline-flex items-center justify-center rounded-md border border-white/30 bg-black/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white mb-3">
                        <Trophy className="h-3.5 w-3.5 mr-1.5 text-[#D4E048]" /> Hero Banner
                      </span>
                      <h3 className="text-white font-bold text-2xl mb-1">{heroBanner.title}</h3>
                      <p className="text-white/80 text-sm font-medium">{heroBanner.startLocation} &rarr; {heroBanner.endLocation}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 px-5 text-center bg-gray-50/50">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Trophy className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No Hero Banner</h3>
                    <p className="text-sm text-gray-500">Feature a ride to display it here.</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setActiveTab("featured")}
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {heroBanner ? "Change Hero Banner" : "Set Hero Banner"}
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div >
  );
}
