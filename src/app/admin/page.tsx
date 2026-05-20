"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Bike,
  BookOpen,
  CheckSquare,
  Star,
  Map,
  Users,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  UserCircle,
  Loader2,
  Package,
  CloudUpload,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { DashboardTab } from "./DashboardTab";
import { RidesTab } from "./RidesTab";
import { StoriesTab } from "./StoriesTab";
import { PublishedTab } from "./PublishedTab";
import { FeaturedTab } from "./FeaturedTab";
import { RoutesTab } from "./RoutesTab";
import { UsersTab } from "./UsersTab";

import { ClaimsTab } from "./ClaimsTab";

// ─── Types ────────────────────────────────────────────────────────────────────
import type { SkillLevel, Ride, Story, AppUser, Metrics, Activity, TabId } from "./types";
// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_METRICS: Metrics = {
  pendingRides: 4,
  publishedRides: 12,
  totalRiders: 138,
  pendingStories: 3,
};

const ACTIVITIES: Activity[] = [
  { id: 1, message: '"Mountain Loop #2" was approved', actionSeverity: "SUCCESS", createdAt: "2026-05-17" },
  { id: 2, message: '"Evening Coastal Ride" was submitted', actionSeverity: "WARNING", createdAt: "2026-05-16" },
  { id: 3, message: 'User "Karthik M" was banned', actionSeverity: "DEFAULT", createdAt: "2026-05-15" },
];

// ─── Nav Config ───────────────────────────────────────────────────────────────

interface NavItem {
  id: TabId;
  icon: React.ElementType;
  label: string;
  category: string;
  badgeKey?: keyof Metrics;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", category: "Overview" },
  { id: "rides", icon: Bike, label: "Ride Submissions", category: "Moderation", badgeKey: "pendingRides" },
  { id: "stories", icon: BookOpen, label: "Stories", category: "Moderation", badgeKey: "pendingStories" },
  { id: "published", icon: CheckSquare, label: "Published Rides", category: "Moderation" },
  { id: "featured", icon: Star, label: "Featured Slots", category: "Content" },
  { id: "routes", icon: Map, label: "Routes / Map", category: "Content" },
  { id: "users", icon: Users, label: "Users", category: "Community" },
  { id: "claims", icon: Package, label: "Gear Claims", category: "Community" },
];

const NAV_CATEGORIES = ["Overview", "Moderation", "Content", "Community"];

const TAB_TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  rides: "Ride Submissions",
  stories: "Story Submissions",
  published: "Published Rides",
  featured: "Featured Slots",
  routes: "Routes / Map",
  users: "User Management",
  claims: "Gear Claims",
};

// ─── Skill Badge ──────────────────────────────────────────────────────────────

export function SkillBadge({ level }: { level: SkillLevel }) {
  const colorMap = {
    BEGINNER: "bg-blue-50 text-black border-blue-200",
    INTERMEDIATE: "bg-amber-50 text-black border-amber-200",
    ADVANCED: "bg-emerald-50 text-black border-emerald-200",
  };
  return (
    <Badge className={cn("font-semibold", colorMap[level])}>
      {level}
    </Badge>
  );
}

// ─── Sub Tabs ─────────────────────────────────────────────────────────────────

export function SubTabs({
  tabs,
  active,
  setActive,
  counts,
}: {
  tabs: string[];
  active: string;
  setActive: (t: string) => void;
  counts?: Record<string, number>;
}) {
  return (
    <div className="flex gap-1 border-b mb-6">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors",
            active === t
              ? "text-[#D4E048] border-b-2 border-[#D4E048]"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {t.charAt(0).toUpperCase() + t.slice(1)}
          {counts?.[t] && counts[t] > 0 ? (
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {counts[t]}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function DesktopSidebar({
  open,
  setOpen,
  active,
  setActive,
  metrics,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  active: TabId;
  setActive: (t: TabId) => void;
  metrics: Metrics;
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 bg-white border-r transition-all duration-200 shrink-0 z-40",
          open ? "w-[260px]" : "w-[64px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b shrink-0 h-16",
            open ? "px-6 justify-between" : "justify-center"
          )}
        >
          {open ? (
            <>
              <img src="public/logo.svg" className="max-w-38" alt="Rimoto Logo" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-8 w-8 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 py-3">
          {NAV_CATEGORIES.map((cat) => {
            const items = NAV_ITEMS.filter((n) => n.category === cat);
            return (
              <div key={cat} className="mb-1">
                {open && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 pt-4 pb-2">
                    {cat}
                  </p>
                )}
                {!open && <Separator className="my-2 mx-3 w-auto" />}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  const count = item.badgeKey ? metrics[item.badgeKey] : 0;
                  const btn = (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={cn(
                        "w-full flex items-center transition-colors duration-150",
                        open ? "gap-3 px-5 py-2.5 text-left" : "justify-center py-2.5",
                        isActive
                          ? "bg-[#D4E048]/10 text-black font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={cn("shrink-0", open ? "h-4 w-4" : "h-5 w-5")} />
                      {open && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {count > 0 && (
                            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                              {count}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                  return open ? (
                    btn
                  ) : (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="text-sm font-medium">
                        {item.label}
                        {count > 0 && ` (${count})`}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            );
          })}
        </ScrollArea>

        {/* User Footer */}
        <div className={cn("border-t shrink-0", open ? "p-5" : "py-4 flex justify-center")}>
          {open ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#D4E048]/20 rounded-full flex items-center justify-center shrink-0">
                <UserCircle className="h-4 w-4 text-[#D4E048]" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate max-w-[130px]">admin@rimoto.in</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#D4E048]/20 rounded-full flex items-center justify-center mb-3">
              <UserCircle className="h-4 w-4 text-[#D4E048]" />
            </div>
          )}
          {open ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Logout
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleLogout} variant="ghost" size="icon" className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-sm font-medium">
                Logout
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function MobileSidebar({
  open,
  setOpen,
  active,
  setActive,
  metrics,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  active: TabId;
  setActive: (t: TabId) => void;
  metrics: Metrics;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetHeader className="px-6 h-16 flex flex-row items-center justify-between border-b">
          <img src="public/logo.svg" alt="Rimoto Logo" />
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="py-3">
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat} className="mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-5 pt-4 pb-2">
                  {cat}
                </p>
                {NAV_ITEMS.filter((n) => n.category === cat).map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  const count = item.badgeKey ? metrics[item.badgeKey] : 0;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActive(item.id); setOpen(false); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-2.5 transition-colors",
                        isActive
                          ? "bg-[#D4E048]/10 text-black font-semibold"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                      {count > 0 && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({
  active,
}: {
  active: TabId;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-5 md:px-8 bg-white border-b shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          {TAB_TITLES[active]}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" asChild>
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex">
            <ExternalLink className="h-3 w-3 mr-1.5" />
            Live Site
          </a>
        </Button>
      </div>
    </header>
  );
}

// ─── Ride Detail Modal ────────────────────────────────────────────────────────

function RideDetailModal({
  ride,
  onClose,
  onAction
}: {
  ride: Ride | null;
  onClose: () => void;
  onAction?: (id: string, action: "APPROVE" | "REJECT", featuredSlot?: string) => void;
}) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    setCurrentImages(ride?.imageUrls?.map(u => u.replace(/['"]/g, '')) || []);
    setUploadFiles([]);
  }, [ride?.id]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)].slice(0, 10));
    }
  };

  const handleAction = async (action: "APPROVE" | "REJECT", slot?: string) => {
    if (!ride || !onAction) return;
    setLoadingAction(action + (slot || ""));
    await onAction(ride.id, action, slot);
    setLoadingAction(null);
  };

  const handleDeleteImage = async (indexToRemove: number) => {
    if (!ride) return;
    const updated = currentImages.filter((_, i) => i !== indexToRemove);
    setDeleteLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/admin/submissions/rides/${ride.id}/images`,
        { imageUrls: updated },
        { withCredentials: true }
      );
      setCurrentImages(updated);
    } catch {
      alert('Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!ride || uploadFiles.length === 0) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      uploadFiles.forEach(f => formData.append('images', f));
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/admin/submissions/rides/${ride.id}/images`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const urls: string[] = (res.data.imageUrls as string[]).map(u => u.replace(/['"]/g, ''));
      setCurrentImages(urls);
      setUploadFiles([]);
    } catch {
      alert('Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Dialog open={!!ride} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ride?.title}</DialogTitle>
          <DialogDescription>Ride Submission Details</DialogDescription>
        </DialogHeader>
        {ride && (
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              {[
                ["Route", `${ride.startLocation} → ${ride.endLocation}`],
                ["Date", new Date(ride.dateScheduled).toLocaleDateString()],
                ["Start Time", ride.timeStart],
                ["Distance", `${ride.distanceKm} km`],
                ["Organizer", `${ride.organizer?.firstName} ${ride.organizer?.lastName}`],
                ["Group", ride.organizer?.clubAffiliation || "Independent"],
                ["Contact", ride.organizer?.contactNumber || "—"],
                ["Bike Type", ride.bikeRequirement],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="font-extrabold text-gray-900 text-sm">{value}</p>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Skill Level</p>
                <SkillBadge level={ride.skillLevel} />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Images ({currentImages.length})</p>
              {currentImages.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {currentImages.map((url, i) => (
                    <div key={i} className="relative shrink-0 group">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} crossOrigin="anonymous" alt={`Ride ${i + 1}`} className="h-16 rounded-md object-cover border" />
                      </a>
                      <button
                        type="button"
                        disabled={deleteLoading}
                        onClick={() => handleDeleteImage(i)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md py-4 text-center text-sm text-gray-400">No images</div>
              )}
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-colors",
                isDragging ? "border-[#b5c03c] bg-[#D4E048]/10" : "border-gray-200 bg-gray-50/50"
              )}
            >
              <div className="h-8 w-8 rounded-full border border-gray-200 bg-white flex items-center justify-center mb-2 shadow-sm">
                <CloudUpload className="h-4 w-4 text-gray-700" />
              </div>
              <p className="font-semibold text-gray-900 text-sm mb-0.5">Choose a file or drag & drop here.</p>
              <p className="text-xs text-gray-500 mb-3">JPEG, PNG, up to 10 MB.</p>
              <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-900 text-gray-50 hover:bg-gray-800 h-8 px-4 py-2 transition-colors shadow-sm">
                Browse File
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) {
                      setUploadFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 10));
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              
              {uploadFiles.length > 0 && (
                <div className="w-full mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {uploadFiles.map((f, i) => (
                      <div key={i} className="relative w-12 h-12 rounded-md border border-gray-200 overflow-hidden shrink-0 shadow-sm bg-white p-0.5">
                        <img src={URL.createObjectURL(f)} alt={`preview ${i}`} className="w-full h-full object-cover rounded-[3px]" />
                        <button type="button" onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 border border-gray-200 hover:border-red-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] shadow-sm transition-colors">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto h-8 text-xs"
                    disabled={uploadLoading}
                    onClick={handleImageUpload}
                  >
                    {uploadLoading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <CloudUpload className="h-3 w-3 mr-1.5" />}
                    {uploadLoading ? "Uploading..." : `Upload ${uploadFiles.length} File${uploadFiles.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => handleAction("APPROVE")} disabled={!!loadingAction} className="flex-1">
                {loadingAction === "APPROVE" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />} Approve
              </Button>
              <Button onClick={() => handleAction("APPROVE", "HERO_BANNER")} disabled={!!loadingAction} className="flex-1">
                {loadingAction === "APPROVEHERO_BANNER" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />} Feature
              </Button>
              <Button onClick={() => handleAction("REJECT")} disabled={!!loadingAction} className="flex-1">
                {loadingAction === "REJECT" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />} Reject
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Root (AdminCommunity) ────────────────────────────────────────────────────

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1', withCredentials: true });

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  const [metrics, setMetrics] = useState<Metrics>(MOCK_METRICS);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);

  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [approvedRides, setApprovedRides] = useState<Ride[]>([]);
  const [rejectedRides, setRejectedRides] = useState<Ride[]>([]);

  const [pendingStories, setPendingStories] = useState<Story[]>([]);
  const [approvedStories, setApprovedStories] = useState<Story[]>([]);
  const [rejectedStories, setRejectedStories] = useState<Story[]>([]);

  const [users, setUsers] = useState<AppUser[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      const metricsRes = await api.get('/admin/dashboard/metrics').catch(() => null);
      if (metricsRes?.data) {
        setMetrics({
          pendingRides: metricsRes.data.pendingRides,
          publishedRides: metricsRes.data.publishedRides,
          totalRiders: metricsRes.data.totalRiders,
          pendingStories: metricsRes.data.pendingStories,
        });
        setActivities(metricsRes.data.recentActivity || []);
      }

      const [pendRides, appRides, rejRides] = await Promise.all([
        api.get('/admin/submissions/rides?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/rides?status=APPROVED').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/rides?status=REJECTED').catch(() => ({ data: { data: [] } })),
      ]);
      setPendingRides(pendRides.data?.data || []);
      setApprovedRides(appRides.data?.data || []);
      setRejectedRides(rejRides.data?.data || []);

      const [pendStories, appStories, rejStories] = await Promise.all([
        api.get('/admin/submissions/stories?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/stories?status=APPROVED').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/stories?status=REJECTED').catch(() => ({ data: { data: [] } })),
      ]);
      setPendingStories(pendStories.data?.data || []);
      setApprovedStories(appStories.data?.data || []);
      setRejectedStories(rejStories.data?.data || []);

      const usersRes = await api.get('/admin/users').catch(() => ({ data: { data: [] } }));
      setUsers(usersRes.data?.data || []);

      const routesRes = await api.get('/public/popular-routes').catch(() => ({ data: { data: [] } }));
      setPopularRoutes(routesRes.data?.data || []);

      const claimsRes = await api.get('/admin/claims').catch(() => ({ data: { data: [] } }));
      setClaims(claimsRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleRideAction = async (id: string, action: "APPROVE" | "REJECT", featuredSlot?: string) => {
    try {
      await api.post(`/admin/submissions/rides/${id}/review`, { action, ...(featuredSlot && { featuredSlot }) });
      setSelectedRide(null);
      await fetchAdminData();
    } catch (err) {
      console.error("Ride action failed", err);
      alert("Failed to perform action.");
    }
  };

  const handleStoryAction = async (id: string, action: "APPROVE" | "REJECT" | "PENDING") => {
    try {
      await api.post(`/admin/submissions/stories/${id}/review`, { action });
      await fetchAdminData();
    } catch (err) {
      console.error("Story action failed", err);
      alert("Failed to perform story action.");
    }
  };

  const handleUserAction = async (type: string, id: string, payload?: object) => {
    try {
      if (type === "role") await api.post(`/admin/users/${id}/role`, payload);
      else if (type === "ban") await api.post(`/admin/users/${id}/ban`, payload);
      else if (type === "delete") await api.delete(`/admin/users/${id}`);
      await fetchAdminData();
    } catch (err) {
      console.error("User action failed", err);
      alert("Failed to perform user action.");
    }
  };

  const handleFeaturedSave = async (slots: { rideId: string; slot: string }[]) => {
    await api.put('/admin/content/featured', { slots });
    await fetchAdminData();
  };

  const handlePopularRouteAction = async (action: "CREATE" | "DELETE", payload?: any) => {
    try {
      if (action === "CREATE") await api.post('/admin/popular-routes', payload);
      else await api.delete(`/admin/popular-routes/${payload.id}`);
      await fetchAdminData();
    } catch (err) {
      console.error("Route action failed", err);
      alert("Failed to perform route action.");
    }
  };

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMenuClick = useCallback(() => {
    if (isMobile) setMobileSidebarOpen(true);
    else setSidebarOpen((v) => !v);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <DesktopSidebar open={sidebarOpen} setOpen={setSidebarOpen} active={activeTab} setActive={setActiveTab} metrics={metrics} />
      <MobileSidebar open={mobileSidebarOpen} setOpen={setMobileSidebarOpen} active={activeTab} setActive={setActiveTab} metrics={metrics} />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar active={activeTab} onMenuClick={handleMenuClick} />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-xl font-semibold text-gray-500 animate-pulse">Loading Data...</div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <DashboardTab metrics={metrics} pendingRides={pendingRides} approvedRides={approvedRides} activities={activities}
              setActiveTab={setActiveTab} setSelectedRide={setSelectedRide} onAction={handleRideAction} />
          )}
          {activeTab === "rides" && (
            <RidesTab pendingRides={pendingRides} approvedRides={approvedRides} rejectedRides={rejectedRides}
              setSelectedRide={setSelectedRide} onAction={handleRideAction} />
          )}
          {activeTab === "stories" && (
            <StoriesTab pendingStories={pendingStories} approvedStories={approvedStories} rejectedStories={rejectedStories}
              onAction={handleStoryAction} />
          )}
          {activeTab === "published" && (
            <PublishedTab approvedRides={approvedRides} setActiveTab={setActiveTab} onAction={handleRideAction} />
          )}
          {activeTab === "featured" && <FeaturedTab approvedRides={approvedRides} onSave={handleFeaturedSave} />}
          {activeTab === "routes" && <RoutesTab popularRoutes={popularRoutes} onAction={handlePopularRouteAction} />}
          {activeTab === "users" && <UsersTab users={users} onAction={handleUserAction} />}
          {activeTab === "claims" && <ClaimsTab claims={claims} />}
        </main>
      </div>

      <RideDetailModal ride={selectedRide} onClose={() => setSelectedRide(null)} onAction={handleRideAction} />
    </div>
  );
}
