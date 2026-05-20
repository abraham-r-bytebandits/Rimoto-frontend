"use client";

import { useState } from "react";
import {
  Star,
  X,
  Check,
  RotateCcw,
  Eye,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ride } from "./types";
import { SkillBadge, SubTabs } from "./page";

// ─── Rides Tab ────────────────────────────────────────────────────────────────

export function RidesTab({
  pendingRides,
  approvedRides,
  rejectedRides,
  setSelectedRide,
  onAction,
}: {
  pendingRides: Ride[];
  approvedRides: Ride[];
  rejectedRides: Ride[];
  setSelectedRide: (r: Ride) => void;
  onAction?: (id: string, action: "APPROVE" | "REJECT") => Promise<void>;
}) {
  const [sub, setSub] = useState("pending");
  const [filter, setFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!onAction) return;
    setActionLoading(`${action}-${id}`);
    await onAction(id, action);
    setActionLoading(null);
  };

  const filterRides = (rides: Ride[]) =>
    rides
      .filter((r) => r.title.toLowerCase().includes(filter.toLowerCase()))
      .filter((r) => skillFilter === "all" || r.skillLevel === skillFilter.toUpperCase());

  const rideMap: Record<string, Ride[]> = {
    pending: filterRides(pendingRides),
    approved: filterRides(approvedRides),
    rejected: filterRides(rejectedRides),
  };

  const columns = (type: string) => {
    switch (type) {
      case "pending":
        return ["Ride", "Route", "Date / Time", "Organizer", "Skill", "Bike", "Actions"];
      case "approved":
        return ["Ride", "Route", "Date", "Skill", "Featured", "WA Joins", "Actions"];
      case "rejected":
        return ["Ride", "Route", "Organizer", "Skill", "Submitted", "Actions"];
      default:
        return [];
    }
  };

  return (
    <div>
      <SubTabs tabs={["pending", "approved", "rejected"]} active={sub} setActive={setSub} counts={{ pending: pendingRides.length }} />

      <div className="flex gap-4 mb-6 flex-wrap">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search rides..."
          className="max-w-xs"
        />
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent>
            {["all", "beginner", "intermediate", "advanced"].map((v) => (
              <SelectItem key={v} value={v}>
                {v === "all" ? "All Levels" : v.charAt(0).toUpperCase() + v.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                {columns(sub).map((h) => (
                  <TableHead key={h} className={cn("font-semibold text-gray-900", h === "Actions" ? "text-right" : "")}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {rideMap[sub].length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns(sub).length} className="text-center py-12 text-gray-400">
                    No {sub} rides
                  </TableCell>
                </TableRow>
              ) : (
                rideMap[sub].map((ride) => (
                  <TableRow key={ride.id} className="hover:bg-gray-50 transition-colors duration-200">
                    {/* Common columns: Ride & Route */}
                    <TableCell className="font-medium text-gray-900">{ride.title}</TableCell>
                    <TableCell className="text-gray-600">{ride.startLocation} &rarr; {ride.endLocation}</TableCell>

                    {/* Pending Specific Cells */}
                    {sub === "pending" && (
                      <>
                        <TableCell className="whitespace-nowrap">{new Date(ride.dateScheduled).toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{ride.organizer.firstName} {ride.organizer.lastName}</TableCell>
                        <TableCell className="whitespace-nowrap"><SkillBadge level={ride.skillLevel} /></TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">{ride.bikeRequirement}</TableCell>
                      </>
                    )}

                    {/* Approved Specific Cells */}
                    {sub === "approved" && (
                      <>
                        <TableCell className="whitespace-nowrap">{new Date(ride.dateScheduled).toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap"><SkillBadge level={ride.skillLevel} /></TableCell>
                        <TableCell className="whitespace-nowrap">
                          {ride.featuredSlot ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                              <Star className="h-3.5 w-3.5 fill-current text-amber-500" /> {ride.featuredSlot.replace(/_/g, " ")}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{ride.whatsappJoinsCount}</TableCell>
                      </>
                    )}

                    {/* Rejected Specific Cells */}
                    {sub === "rejected" && (
                      <>
                        <TableCell className="whitespace-nowrap">{ride.organizer.firstName} {ride.organizer.lastName}</TableCell>
                        <TableCell className="whitespace-nowrap"><SkillBadge level={ride.skillLevel} /></TableCell>
                        <TableCell className="text-sm text-gray-500 whitespace-nowrap">{new Date(ride.createdAt).toLocaleDateString()}</TableCell>
                      </>
                    )}

                    {/* Actions Column */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {sub === "pending" && (
                          <>
                            <button
                              onClick={() => setSelectedRide(ride)}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleAction(ride.id, "APPROVE")}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#D4E048] p-1.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === `APPROVE-${ride.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleAction(ride.id, "REJECT")}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-50 p-1.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            </button>
                          </>
                        )}

                        {sub === "approved" && (
                          <button
                            onClick={() => setSelectedRide(ride)}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}

                        {sub === "rejected" && (
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction(ride.id, "APPROVE")}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#D4E048] px-3 py-1.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-colors gap-1.5"
                          >
                            {actionLoading === `APPROVE-${ride.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4" /> Re-approve
                              </>
                            )}
                          </button>
                        )}
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
