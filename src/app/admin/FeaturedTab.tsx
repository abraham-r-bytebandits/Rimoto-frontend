"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Trophy,
  Loader2,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Ride } from "./types";

// ─── Featured Tab ─────────────────────────────────────────────────────────────

export function FeaturedTab({
  approvedRides,
  onSave
}: {
  approvedRides: Ride[];
  onSave?: (slots: { rideId: string; slot: string }[]) => Promise<void>;
}) {
  const buildInitialDraft = () => {
    const d: Record<string, string> = { HERO_BANNER: "" };
    approvedRides.forEach((r) => {
      if (r.featuredSlot === "HERO_BANNER") d["HERO_BANNER"] = r.id;
    });
    return d;
  };

  const [draft, setDraft] = useState<Record<string, string>>(buildInitialDraft);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setDraft(buildInitialDraft());
  }, [approvedRides]);

  const allFilled = !!draft["HERO_BANNER"];
  const assigned = approvedRides.find((r) => r.id === draft["HERO_BANNER"]) ?? null;

  const save = async () => {
    if (!onSave || !allFilled) return;
    setError("");
    setMsg("");
    setSaving(true);
    try {
      await onSave([{ rideId: draft["HERO_BANNER"], slot: "HERO_BANNER" }]);
      setMsg("Hero Banner saved!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setError("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Content Management</p>
          <h2 className="text-2xl font-bold text-gray-900">Hero Banner</h2>
        </div>
        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">Featured Slot</span>
      </div>

      {approvedRides.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-24 text-center text-sm text-gray-400">
          No approved rides available to feature.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[420px]">
          {/* Preview Banner */}
          <div className="relative bg-gray-950 lg:w-1/2 min-h-[300px] flex flex-col justify-end p-8 overflow-hidden">
            {assigned ? (
              <>
                {assigned.imageUrls?.length > 0 ? (
                  <img
                    src={assigned.imageUrls[0].replace(/['"]/g, '')}
                    crossOrigin="anonymous"
                    alt={assigned.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-zinc-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-0" />
                <div className="relative z-10 flex flex-col h-full justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider mb-4 w-fit backdrop-blur-sm">
                    <Trophy className="h-3.5 w-3.5 text-[#D4E048] fill-current animate-bounce" /> Hero Banner
                  </span>
                  <h3 className="text-3xl font-extrabold text-white leading-tight mb-1.5">{assigned.title}</h3>
                  <p className="text-white/80 font-medium text-sm flex items-center gap-1">📍 {assigned.startLocation} &rarr; {assigned.endLocation}</p>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-zinc-950 flex flex-col items-center justify-center text-center p-6">
                <Trophy className="h-12 w-12 text-white/20 mb-3" />
                <p className="text-white/40 text-sm font-semibold uppercase tracking-wider">No ride selected</p>
                <p className="text-white/25 text-xs mt-1">Assign an approved ride from the dropdown to preview it here</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="lg:w-1/2 flex flex-col p-8 justify-between bg-white border-t lg:border-t-0 lg:border-l border-gray-100">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Trophy className="h-5 w-5 text-[#b5c03c]" />
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Assign Hero Banner</h4>
              </div>

              <div className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg border",
                allFilled ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"
              )}>
                <div className={cn("w-2 h-2 rounded-full", allFilled ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-ping")} />
                {allFilled ? "Ready to publish featured ride" : "Please select an approved ride below"}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 block">Select Ride</label>
                <Select
                  value={draft["HERO_BANNER"] || ""}
                  onValueChange={(v) => { setMsg(""); setDraft((p) => ({ ...p, HERO_BANNER: v })); }}
                >
                  <SelectTrigger className="w-full h-11 rounded-lg border-gray-300">
                    <SelectValue placeholder="Select an approved ride" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedRides.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.title} ({r.startLocation} &rarr; {r.endLocation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {assigned && (
                <div className="bg-gray-50/50 border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Currently Assigned Details</p>
                  <p className="font-extrabold text-gray-900 text-base leading-snug">{assigned.title}</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Route</span>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{assigned.startLocation} &rarr; {assigned.endLocation}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Date</span>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">{new Date(assigned.dateScheduled).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100 mt-8">
              <button
                onClick={save}
                disabled={!allFilled || saving}
                className="w-full inline-flex items-center justify-center rounded-lg text-sm font-bold bg-[#D4E048] py-3 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-all shadow-sm gap-2 uppercase tracking-wider"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Hero Banner"}
              </button>
              {msg && <p className="text-xs font-bold text-emerald-600 text-center flex items-center justify-center gap-1.5"><Check className="h-3.5 w-3.5" />{msg}</p>}
              {error && <p className="text-xs font-bold text-red-600 text-center flex items-center justify-center gap-1.5"><X className="h-3.5 w-3.5" />{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
