"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Upload, message, Image, Carousel } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
  Menu,
  X,
  Check,
  Ban,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  TrendingUp,
  Activity,
  Eye,
  Trophy,
  Pencil,
  ShieldCheck,
  UserCircle,
  Loader2,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type RideStatus = "PENDING" | "APPROVED" | "REJECTED";
type StoryStatus = "PENDING" | "APPROVED" | "REJECTED";
type UserRole = "USER" | "ADMIN";
type FeaturedSlot = "HERO_BANNER";

interface Organizer {
  firstName: string;
  lastName: string;
  clubAffiliation?: string;
  contactNumber?: string;
}

interface Ride {
  id: string;
  title: string;
  startLocation: string;
  endLocation: string;
  dateScheduled: string;
  timeStart: string;
  distanceKm: number;
  skillLevel: SkillLevel;
  bikeRequirement: string;
  whatsappJoinsCount: number;
  organizer: Organizer;
  createdAt: string;
  status: RideStatus;
  featuredSlot?: FeaturedSlot | null;
  imageUrls?: string[];
}

interface Story {
  id: string;
  title: string;
  destinationTag: string;
  flairType: string;
  mediaMeta: { photos: number; videos: number };
  status: StoryStatus;
  postType: "STORY" | "REVIEW";
  images?: string[];
  contentBody: string;
  author: { firstName: string; lastName: string; avatarUrl?: string };
  createdAt: string;
}

interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  strikeCount: number;
  clubAffiliation?: string;
  contactNumber?: string;
  joinedAt: string;
}

interface Metrics {
  pendingRides: number;
  publishedRides: number;
  totalRiders: number;
  pendingStories: number;
}

interface Activity {
  id: number;
  message: string;
  actionSeverity: "SUCCESS" | "WARNING" | "DEFAULT";
  createdAt: string;
}

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

type TabId = "dashboard" | "rides" | "stories" | "published" | "featured" | "routes" | "users" | "claims";

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

function SkillBadge({ level }: { level: SkillLevel }) {
  let badgeVariant: 'neutral' | 'warning' | 'advanced' = 'neutral';
  if (level === 'INTERMEDIATE') badgeVariant = 'warning';
  if (level === 'ADVANCED') badgeVariant = 'advanced';

  return (
    <Badge variant={badgeVariant} className="rounded-none">
      {level}
    </Badge>
  );
}

// ─── Sub Tabs ─────────────────────────────────────────────────────────────────

function SubTabs({
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
    <div className="flex gap-0 border-b border-black mb-5">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={cn(
            "relative px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 -mb-px",
            active === t
              ? "text-black border-[#E8FF47]"
              : "text-black/40 border-transparent hover:text-black/70"
          )}
        >
          {t}
          {counts?.[t] && counts[t] > 0 ? (
            <span className="ml-2 bg-black text-white text-[9px] font-bold px-1.5 py-px">
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
          "hidden md:flex flex-col h-screen sticky top-0 bg-[#F5F3EE] border-r border-black transition-all duration-200 shrink-0 z-40",
          open ? "w-[260px]" : "w-[64px]"
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-black shrink-0 h-[72px]",
            open ? "px-6 justify-between" : "justify-center"
          )}
        >
          {open ? (
            <>
              <div>
                <div className="font-display text-[20px] font-bold tracking-wide leading-none">
                  <img src="/logo.svg" alt="logo" className="max-w-36" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 border border-black rounded-none hover:bg-black hover:text-white"
                onClick={() => setOpen(false)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none hover:bg-black/10"
              onClick={() => setOpen(true)}
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
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 px-5 pt-4 pb-2">
                    {cat}
                  </p>
                )}
                {!open && <Separator className="my-2 mx-3 w-auto bg-black/10" />}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  const count = item.badgeKey ? metrics[item.badgeKey] : 0;
                  const btn = (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={cn(
                        "w-full flex items-center transition-all duration-150 border-l-4",
                        open ? "gap-3 px-5 py-2.5 text-left" : "justify-center py-2.5",
                        isActive
                          ? "bg-[#E8FF47] border-black opacity-100"
                          : "border-transparent opacity-50 hover:opacity-90 hover:bg-black/5"
                      )}
                    >
                      <Icon className={cn("shrink-0", open ? "h-4 w-4" : "h-5 w-5")} />
                      {open && (
                        <>
                          <span className="flex-1 text-[11px] font-bold uppercase tracking-widest">
                            {item.label}
                          </span>
                          {count > 0 && (
                            <span className="bg-black text-white text-[9px] font-bold px-1.5 py-px">
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
                      <TooltipContent side="right" className="rounded-none text-[11px] font-bold uppercase tracking-widest">
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
        <div className={cn("border-t border-black shrink-0", open ? "p-5" : "py-4 flex justify-center")}>
          {open ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#E8FF47] border border-black flex items-center justify-center shrink-0">
                <UserCircle className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold uppercase tracking-wide truncate max-w-[130px]">
                  admin@rimoto.in
                </p>
                <p className="text-[9px] uppercase tracking-[0.15em] opacity-40">Super Admin</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-black border border-black text-white flex items-center justify-center mb-3">
              <UserCircle className="h-4 w-4" />
            </div>
          )}
          {open ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full rounded-none border-black text-[10px] font-bold uppercase tracking-widest h-8 hover:bg-black hover:text-white"
            >
              <LogOut className="h-3 w-3 mr-2" />
              Logout
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleLogout} variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-black/10">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-none text-[11px] font-bold uppercase tracking-widest">
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
      <SheetContent side="left" className="w-[260px] p-0 bg-[#F5F3EE] border-r border-black rounded-none">
        <SheetHeader className="px-6 h-[72px] flex flex-row items-center justify-between border-b border-black">
          <SheetTitle className="font-display text-[18px] font-bold tracking-wide text-left">
            RIMOTO <em className="not-italic bg-[#E8FF47] px-1.5">ADMIN</em>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-72px)]">
          <div className="py-3">
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat} className="mb-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 px-5 pt-4 pb-2">
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
                        "w-full flex items-center gap-3 px-5 py-2.5 border-l-4 transition-all",
                        isActive
                          ? "bg-[#E8FF47] border-black opacity-100"
                          : "border-transparent opacity-50 hover:opacity-90 hover:bg-black/5"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-[11px] font-bold uppercase tracking-widest text-left">
                        {item.label}
                      </span>
                      {count > 0 && (
                        <span className="bg-black text-white text-[9px] font-bold px-1.5 py-px">
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
  onMenuClick,
}: {
  active: TabId;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-[72px] flex items-center justify-between px-5 md:px-8 bg-[#F5F3EE] border-b border-black shrink-0">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onMenuClick}
          className="rounded-none border-black h-9 w-9 hover:bg-black hover:text-white shrink-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="font-display text-[clamp(16px,3vw,26px)] font-bold uppercase tracking-wide leading-none">
          {TAB_TITLES[active]}
        </h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="rounded-none border-black h-9 bg-[#E8FF47] hover:bg-black hover:text-[#E8FF47] text-[10px] font-bold uppercase tracking-widest"
          asChild
        >
          <a href="/" target="_blank" rel="noopener noreferrer" className="sm:flex">
            <ExternalLink className="h-3 w-3 mr-1.5" />
            Live Site
          </a>
        </Button>
      </div>
    </header>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({
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
  activities: Activity[];
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
    { label: "Pending Rides", value: metrics.pendingRides, icon: AlertTriangle, warn: true },
    { label: "Published Rides", value: metrics.publishedRides, icon: TrendingUp, warn: false },
    { label: "Total Riders", value: metrics.totalRiders, icon: Users, warn: false },
    { label: "Stories Pending", value: metrics.pendingStories, icon: Activity, warn: true },
  ];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="rounded-none border border-black shadow-none bg-white relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 right-0 h-[3px]", s.warn ? "bg-[#E8FF47]" : "bg-black")} />
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/50 flex items-center justify-between">
                  {s.label}
                  <Icon className="h-3.5 w-3.5 text-black/30" />
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className="font-display text-[40px] leading-none">{s.value}</p>
                {s.warn && (
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-2 bg-[#E8FF47] inline-block px-1.5 py-0.5">
                    Needs review
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Rides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px] font-bold uppercase tracking-wide">Pending Submissions</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            {pendingRides.length} awaiting
          </span>
        </div>
        <div className="border border-black bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-black hover:bg-transparent bg-black">
                {["Img", "Ride", "Route", "Date", "Organizer", "Skill", "Actions"].map((h) => (
                  <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRides.slice(0, 4).map((ride) => (
                <TableRow key={ride.id} className="border-b border-black/10 hover:bg-[#F5F3EE] transition-colors">
                  <TableCell className="py-3 px-4">
                    {ride.imageUrls && ride.imageUrls.length > 0 ? (
                      <img src={ride.imageUrls[0].replace(/['"]/g, '')} crossOrigin="anonymous" alt="thumb" className="h-9 w-14 object-cover border border-black" />
                    ) : (
                      <div className="h-9 w-14 bg-black/10 border border-black/20 flex items-center justify-center text-[16px]">🏍️</div>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <p className="font-bold text-[13px] uppercase tracking-wide">{ride.title}</p>
                    <p className="text-[10px] opacity-50 mt-0.5">{ride.organizer.clubAffiliation || "Independent"}</p>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[11px] font-bold uppercase opacity-70">
                    {ride.startLocation} → {ride.endLocation}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px] whitespace-nowrap">
                    {new Date(ride.dateScheduled).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-[12px]">
                    {ride.organizer.firstName} {ride.organizer.lastName}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <SkillBadge level={ride.skillLevel} />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      <Button variant="outline" size="sm" className="rounded-none border-black h-7 text-[10px] font-bold uppercase tracking-wide px-2 hover:bg-black hover:text-white" onClick={() => setSelectedRide(ride)}>
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button size="sm" disabled={!!actionLoading} onClick={() => handleDashAction(ride.id, "APPROVE")} className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600">
                        {actionLoading === `APPROVE-${ride.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" disabled={!!actionLoading} onClick={() => handleDashAction(ride.id, "REJECT")} className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-red-50 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600">
                        {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity — fixed height + scroll */}
        <Card className="rounded-none border border-black shadow-none flex flex-col">
          <CardHeader className="border-b border-black bg-black text-white px-5 py-4 shrink-0">
            <CardTitle className="font-display text-[18px] font-bold uppercase tracking-wide flex items-center justify-between">
              Recent Activity
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{activities.length} events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto" style={{ maxHeight: 360 }}>
            {activities.length === 0 ? (
              <div className="py-12 text-center text-[11px] font-bold uppercase tracking-widest opacity-20">No activity yet</div>
            ) : activities.map((a, i) => (
              <div key={a.id} className={cn("flex gap-3 px-5 py-4", i < activities.length - 1 && "border-b border-black/10")}>
                <div className={cn(
                  "w-2 h-2 mt-1.5 shrink-0 border border-black",
                  a.actionSeverity === "SUCCESS" ? "bg-emerald-400" : a.actionSeverity === "WARNING" ? "bg-[#E8FF47]" : "bg-black"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] leading-relaxed">{a.message}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-1">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Management — Hero Banner */}
        {(() => {
          const heroBanner = approvedRides.find(r => r.featuredSlot === "HERO_BANNER");
          return (
            <Card className="rounded-none border border-black shadow-none flex flex-col overflow-hidden">
              <CardHeader className="border-b border-black px-5 py-4 flex-row items-center justify-between shrink-0">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5">Content Management</p>
                  <CardTitle className="font-display text-[18px] font-bold uppercase tracking-wide">Hero Banner</CardTitle>
                </div>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                  heroBanner
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                )}>
                  {heroBanner ? "✓ Active" : "Not Set"}
                </span>
              </CardHeader>

              <CardContent className="p-0 flex flex-col flex-1">
                {heroBanner ? (
                  <>
                    {/* Full-width cinematic image banner */}
                    <div className="relative w-full h-[160px] bg-black shrink-0 overflow-hidden">
                      {heroBanner.imageUrls && (heroBanner.imageUrls as string[]).length > 0 ? (
                        <img
                          src={(heroBanner.imageUrls as string[])[0].replace(/['"]/g, '')}
                          crossOrigin="anonymous"
                          alt={heroBanner.title}
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#444]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span className="inline-flex items-center gap-1 bg-[#E8FF47] text-black text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2">
                          <Trophy className="h-2.5 w-2.5" /> Hero Banner
                        </span>
                        <p className="text-white font-display text-[15px] font-bold uppercase tracking-wide leading-tight">
                          {heroBanner.title}
                        </p>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                          {heroBanner.startLocation} → {heroBanner.endLocation}
                        </p>
                      </div>
                    </div>

                    {/* Ride meta grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 border-b border-black/10">
                      {[
                        ["Date", new Date(heroBanner.dateScheduled).toLocaleDateString()],
                        ["Distance", `${heroBanner.distanceKm} km`],
                        ["Skill Level", heroBanner.skillLevel],
                        ["Bike", heroBanner.bikeRequirement],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-30">{k}</p>
                          <p className="text-[11px] font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-12 px-5 text-center">
                    <Trophy className="h-12 w-12 text-black/10 mb-3" />
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-30">No Hero Banner set</p>
                    <p className="text-[10px] opacity-20 mt-1">Go to Featured Slots to assign one</p>
                  </div>
                )}

                {/* CTA button */}
                <div className="p-3 px-4 mt-auto shrink-0">
                  <Button
                    variant="outline"
                    className="w-full rounded-none border-black text-[10px] font-bold uppercase tracking-widest h-8 hover:bg-black hover:text-white"
                    onClick={() => setActiveTab("featured")}
                  >
                    <Pencil className="h-3 w-3 mr-2" />
                    {heroBanner ? "Change Hero Banner" : "Set Hero Banner"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })()}

      </div>
    </div>
  );
}

// ─── Rides Tab ────────────────────────────────────────────────────────────────

function RidesTab({
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

  return (
    <div>
      <SubTabs
        tabs={["pending", "approved", "rejected"]}
        active={sub}
        setActive={setSub}
        counts={{ pending: pendingRides.length }}
      />
      <div className="flex gap-3 mb-5 flex-wrap">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search rides by name, organizer, route..."
          className="flex-1 min-w-[200px] rounded-none border-black bg-white text-[13px] h-10 focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]"
        />
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[160px] rounded-none border-black h-10 text-[11px] font-bold uppercase tracking-widest focus:ring-0">
            <SelectValue placeholder="Skill Level" />
          </SelectTrigger>
          <SelectContent className="rounded-none border-black">
            {["all", "beginner", "intermediate", "advanced"].map((v) => (
              <SelectItem key={v} value={v} className="text-[11px] font-bold uppercase tracking-widest rounded-none">
                {v === "all" ? "All Levels" : v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-black bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black hover:bg-transparent bg-black">
              {sub === "pending" && ["Ride", "Route", "Date / Time", "Organizer", "Skill", "Bike", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
              {sub === "approved" && ["Ride", "Route", "Date", "Skill", "Featured", "WA Joins", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
              {sub === "rejected" && ["Ride", "Route", "Organizer", "Skill", "Submitted", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rideMap[sub].length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-[11px] font-bold uppercase tracking-widest opacity-30">
                  No {sub} rides
                </TableCell>
              </TableRow>
            ) : rideMap[sub].map((ride) => (
              <TableRow key={ride.id} className="border-b border-black/10 hover:bg-[#F5F3EE] transition-colors">
                <TableCell className="py-3 px-4">
                  <p className="font-bold text-[13px] uppercase tracking-wide">{ride.title}</p>
                </TableCell>
                <TableCell className="py-3 px-4 text-[11px] font-bold uppercase opacity-70">
                  {ride.startLocation} → {ride.endLocation}
                </TableCell>
                <TableCell className="py-3 px-4 text-[12px] whitespace-nowrap">
                  {new Date(ride.dateScheduled).toLocaleDateString()}
                  {sub === "pending" && <span className="block text-[10px] opacity-50">{ride.timeStart}</span>}
                </TableCell>
                {sub === "pending" && (
                  <TableCell className="py-3 px-4 text-[12px]">
                    {ride.organizer.firstName} {ride.organizer.lastName}
                  </TableCell>
                )}
                <TableCell className="py-3 px-4"><SkillBadge level={ride.skillLevel} /></TableCell>
                {sub === "pending" && (
                  <TableCell className="py-3 px-4 text-[11px] opacity-50">{ride.bikeRequirement}</TableCell>
                )}
                {sub === "approved" && (
                  <>
                    <TableCell className="py-3 px-4">
                      {ride.featuredSlot ? (
                        <Badge className="rounded-none bg-[#E8FF47] text-black border border-black text-[9px] font-bold uppercase tracking-widest">
                          <Star className="h-2.5 w-2.5 mr-1" />
                          {ride.featuredSlot.replace(/_/g, " ")}
                        </Badge>
                      ) : (
                        <span className="opacity-25 text-[12px]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-[12px]">{ride.whatsappJoinsCount}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none border-black h-7 text-[10px] font-bold uppercase tracking-wide px-2 hover:bg-black hover:text-white"
                        onClick={() => setSelectedRide(ride)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </>
                )}
                {sub === "rejected" && (
                  <>
                    <TableCell className="py-3 px-4 text-[12px]">{ride.organizer.firstName} {ride.organizer.lastName}</TableCell>
                    <TableCell className="py-3 px-4 text-[11px] opacity-50 whitespace-nowrap">{new Date(ride.createdAt).toLocaleDateString()}</TableCell>
                  </>
                )}
                {(sub === "pending" || sub === "rejected") && (
                  <TableCell className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {sub === "pending" && (
                        <Button variant="outline" size="sm" className="rounded-none border-black h-7 text-[10px] font-bold uppercase tracking-wide px-2 hover:bg-black hover:text-white" onClick={() => setSelectedRide(ride)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" disabled={!!actionLoading} onClick={() => handleAction(ride.id, "APPROVE")} className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600">
                        {actionLoading === `APPROVE-${ride.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : sub === "rejected" ? <><RotateCcw className="h-3 w-3 mr-1" />Re-approve</> : <Check className="h-3 w-3" />}
                      </Button>
                      {sub === "pending" && (
                        <Button size="sm" disabled={!!actionLoading} onClick={() => handleAction(ride.id, "REJECT")} className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-red-50 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600">
                          {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Stories Tab ──────────────────────────────────────────────────────────────

function CreateStoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [flairType, setFlairType] = useState('adv');

  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  const getBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center text-gray-400 hover:text-black transition-colors">
      <PlusOutlined />
      <div className="text-[10px] mt-1 font-semibold uppercase tracking-[0.05em]">Upload</div>
    </div>
  );

  const handleSubmit = async () => {
    if (!postTitle || !postContent || !destinationTag || !flairType) {
      message.error('Please enter title, content, destination, and flair.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', postTitle);
    formData.append('contentBody', postContent);
    formData.append('destinationTag', destinationTag);
    formData.append('flairType', flairType);
    formData.append('postType', 'STORY');

    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('images', file.originFileObj);
      }
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/public/stories`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Story created! It is now pending approval.');
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      message.error('Failed to create story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-none border border-black shadow-[12px_12px_0_#E8FF47] max-w-[600px] p-0">
        <DialogHeader className="border-b border-black bg-black text-white px-7 py-5">
          <DialogTitle className="font-display text-[24px] font-bold uppercase tracking-wide text-white">Create Admin Story</DialogTitle>
          <DialogDescription className="text-white/40 text-[10px] uppercase tracking-widest">Upload a new story with multiple images</DialogDescription>
        </DialogHeader>
        <div className="p-7 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Story Title..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full bg-white border border-black text-black font-sans text-[14px] px-3.5 py-2.5 outline-none focus:border-[#E8FF47]"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Destination (e.g. Ooty)"
              value={destinationTag}
              onChange={(e) => setDestinationTag(e.target.value)}
              className="w-full bg-white border border-black text-black font-sans text-[13px] px-3.5 py-2.5 outline-none"
            />
            <select
              value={flairType}
              onChange={(e) => setFlairType(e.target.value)}
              className="w-full bg-white border border-black text-black font-sans text-[13px] px-3.5 py-2.5 outline-none"
            >
              <option value="adv">Adventure</option>
              <option value="tip">Tips & Tricks</option>
              <option value="gear">Gear</option>
              <option value="int">Info</option>
            </select>
          </div>
          <textarea
            placeholder="Story Content..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-white border border-black text-black font-sans text-[13px] px-3.5 py-2.5 outline-none min-h-[120px] resize-y"
          />
          <div className="mt-1">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              multiple
            >
              {fileList.length >= 5 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Posting...' : 'Create Story'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StoriesTab({
  pendingStories,
  approvedStories,
  rejectedStories,
  onAction,
}: {
  pendingStories: Story[];
  approvedStories: Story[];
  rejectedStories: Story[];
  onAction?: (id: string, action: "APPROVE" | "REJECT" | "PENDING") => Promise<void>;
}) {
  const [postType, setPostType] = useState<"STORY" | "REVIEW">("REVIEW");
  const [sub, setSub] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const storyMap: Record<string, Story[]> = {
    pending: pendingStories.filter(s => s.postType === postType),
    approved: approvedStories.filter(s => s.postType === postType),
    rejected: rejectedStories.filter(s => s.postType === postType),
  };

  const handleAction = async (id: string, action: "APPROVE" | "REJECT" | "PENDING") => {
    if (!onAction) return;
    setActionLoading(`${action}-${id}`);
    await onAction(id, action);
    setActionLoading(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex gap-6">
          <button
            onClick={() => setPostType("REVIEW")}
            className={`font-display text-[22px] tracking-[0.05em] uppercase transition-colors ${postType === "REVIEW" ? "text-black border-b-4 border-accent pb-1" : "text-gray-400 hover:text-black"}`}
          >
            User Reviews
          </button>
          <button
            onClick={() => setPostType("STORY")}
            className={`font-display text-[22px] tracking-[0.05em] uppercase transition-colors ${postType === "STORY" ? "text-black border-b-4 border-accent pb-1" : "text-gray-400 hover:text-black"}`}
          >
            Official Stories
          </button>
        </div>
        {postType === "STORY" && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-black text-black px-6 shadow-[4px_4px_0_0_#E8FF47] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#E8FF47] transition-all">
            + CREATE STORY
          </Button>
        )}
      </div>

      <CreateStoryModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <SubTabs
        tabs={["pending", "approved", "rejected"]}
        active={sub}
        setActive={setSub}
        counts={{ pending: storyMap.pending.length }}
      />

      {storyMap[sub].length === 0 ? (
        <div className="border-2 border-black bg-white p-16 flex flex-col items-center justify-center text-center shadow-[8px_8px_0_0_#F5F5F5]">
          <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
          <h3 className="font-display text-[20px] tracking-wide uppercase text-gray-400">No {sub} {postType.toLowerCase()}s</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {storyMap[sub].map((story) => (
            <div key={story.id} className="bg-white border-2 border-black p-5 flex flex-col gap-4 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#E8FF47] transition-all">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="rounded-none text-[9px] font-bold uppercase tracking-widest">{story.flairType.replace(/_/g, " ")}</Badge>
                    <span className="text-[10px] text-black font-bold uppercase tracking-widest">{new Date(story.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-display text-[18px] font-bold uppercase tracking-wide leading-tight line-clamp-2">{story.title}</h4>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-black mt-1">By {story.author.firstName} {story.author.lastName}</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-600 bg-gray-100 px-2 py-1 w-fit">
                📍 {story.destinationTag}
              </div>

              <p className="text-[13px] leading-relaxed text-gray-700 line-clamp-3">{story.contentBody}</p>

              {story.images && story.images.length > 0 && (
                <div className="w-full max-w-[600px] mx-auto h-[240px] mt-2 border-y border-black relative overflow-hidden bg-gray-100">
                  <Carousel swipeToSlide draggable className="h-full">
                    {story.images.map((imgUrl, idx) => (
                      <div key={idx} className="h-[240px] w-full">
                        <img src={`${imgUrl}`} alt="Post img" className="w-full h-full object-contain pointer-events-none" />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t-2 border-black/10">
                {sub === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(story.id, "APPROVE")}
                      disabled={!!actionLoading}
                      className="flex-1 rounded-none bg-[#E8FF47] text-black border-2 border-black hover:bg-black hover:text-[#E8FF47] text-[11px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      {actionLoading === `APPROVE-${story.id}` ? "..." : <><Check className="w-4 h-4 mr-2" /> Approve</>}
                    </Button>
                    <Button
                      onClick={() => handleAction(story.id, "REJECT")}
                      disabled={!!actionLoading}
                      className="rounded-none bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white px-3 shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                      {actionLoading === `REJECT-${story.id}` ? "..." : <X className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
                {sub === "rejected" && (
                  <Button
                    onClick={() => handleAction(story.id, "APPROVE")}
                    disabled={!!actionLoading}
                    className="flex-1 rounded-none bg-black text-white border-2 border-black hover:bg-[#E8FF47] hover:text-black text-[11px] font-bold uppercase tracking-widest shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    {actionLoading === `APPROVE-${story.id}` ? "..." : <><RotateCcw className="w-4 h-4 mr-2" /> Re-approve</>}
                  </Button>
                )}
                {sub === "approved" && (
                  <div className="flex flex-col gap-2 w-full">
                    <Badge className="rounded-none bg-[#E8FF47] text-black border-2 border-black text-[10px] font-bold uppercase tracking-widest px-3 py-2 flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Live
                    </Badge>
                    <div className="flex gap-2 w-full mt-1">
                      <Button
                        onClick={() => handleAction(story.id, "REJECT")}
                        disabled={!!actionLoading}
                        size="sm"
                        className="flex-1 rounded-none bg-white text-black border-2 border-black hover:bg-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest h-8 shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        {actionLoading === `REJECT-${story.id}` ? "..." : <><Ban className="w-3 h-3 mr-1" /> Reject</>}
                      </Button>
                      <Button
                        onClick={() => handleAction(story.id, "PENDING")}
                        disabled={!!actionLoading}
                        size="sm"
                        className="flex-1 rounded-none bg-white text-black border-2 border-black hover:bg-amber-400 hover:text-black text-[10px] font-bold uppercase tracking-widest h-8 shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        {actionLoading === `PENDING-${story.id}` ? "..." : <><RotateCcw className="w-3 h-3 mr-1" /> Pending</>}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Published Tab ────────────────────────────────────────────────────────────

function PublishedTab({
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
        className="w-full rounded-none border-black bg-white text-[13px] h-10 mb-5 focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]"
      />
      <div className="border border-black bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black hover:bg-transparent bg-black">
              {["Ride", "Route", "Date", "Status", "Featured", "WA Joins", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ride) => (
              <TableRow key={ride.id} className="border-b border-black/10 hover:bg-[#F5F3EE] transition-colors">
                <TableCell className="py-3 px-4">
                  <p className="font-bold text-[13px] uppercase tracking-wide">{ride.title}</p>
                </TableCell>
                <TableCell className="py-3 px-4 text-[11px] font-bold uppercase opacity-70">
                  {ride.startLocation} → {ride.endLocation}
                </TableCell>
                <TableCell className="py-3 px-4 text-[12px] whitespace-nowrap">
                  {new Date(ride.dateScheduled).toLocaleDateString()}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Badge className="rounded-none bg-emerald-100 text-emerald-700 border border-emerald-300 text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Live
                  </Badge>
                </TableCell>
                <TableCell className="py-3 px-4">
                  {ride.featuredSlot ? (
                    <Badge className="rounded-none bg-[#E8FF47] text-black border border-black text-[9px] font-bold uppercase tracking-widest">
                      <Star className="h-2.5 w-2.5 mr-1" />
                      {ride.featuredSlot.replace(/_/g, " ")}
                    </Badge>
                  ) : (
                    <span className="opacity-25 text-[12px]">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4 text-[12px]">{ride.whatsappJoinsCount}</TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex gap-1.5">
                    <Button size="sm" className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-[#E8FF47] text-black border border-black hover:bg-black hover:text-[#E8FF47]" onClick={() => setActiveTab("featured")}>
                      <Star className="h-3 w-3 mr-1" />
                      {ride.featuredSlot ? "Re-Feature" : "Feature"}
                    </Button>
                    <Button size="sm" disabled={!!actionLoading} onClick={() => handleAction(ride.id, "REJECT")} className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-red-50 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600">
                      {actionLoading === `REJECT-${ride.id}` ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Unpublish
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Featured Tab ─────────────────────────────────────────────────────────────

const SLOT_CONFIG: { id: FeaturedSlot; icon: React.ElementType; label: string }[] = [
  { id: "HERO_BANNER", icon: Trophy, label: "Hero Banner" },
];

function FeaturedTab({
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

  const filledCount = SLOT_CONFIG.filter(({ id }) => !!draft[id]).length;
  const allFilled = filledCount === 1;
  const canSave = allFilled && !saving;

  // The currently assigned ride for the HERO_BANNER slot
  const assigned = approvedRides.find((r) => r.id === draft["HERO_BANNER"]) ?? null;


  const save = async () => {
    if (!onSave || !canSave) return;
    setError("");
    setMsg("");
    setSaving(true);
    try {
      await onSave(
        SLOT_CONFIG.map(({ id }) => ({ rideId: draft[id], slot: id }))
      );
      setMsg("Featured slots saved!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setError("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between border-b border-black pb-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] opacity-40 mb-1">Content Management</p>
          <h2 className="font-display text-[26px] font-bold uppercase tracking-wide leading-none">Hero Banner</h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">⭐ Featured Ride Slot</span>
      </div>

      {approvedRides.length === 0 ? (
        <div className="border border-dashed border-black py-24 text-center text-[11px] font-bold uppercase tracking-widest opacity-30">
          No approved rides available.<br />Approve rides first to assign the Hero Banner.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-black bg-white">
          {/* LEFT — Live Preview */}
          <div className="relative bg-black min-h-[340px] flex flex-col border-r border-black overflow-hidden">
            {assigned ? (
              <>
                {/* Background image or gradient */}
                {assigned.imageUrls && (assigned.imageUrls as string[]).length > 0 ? (
                  <img
                    src={(assigned.imageUrls as string[])[0].replace(/['"]/g, '')}
                    crossOrigin="anonymous"
                    alt={assigned.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#333]" />
                )}
                <div className="relative z-10 flex flex-col h-full p-8 justify-end">
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-[#E8FF47] text-black text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 mb-4">
                      <Trophy className="h-3 w-3" /> Hero Banner
                    </span>
                    <h3 className="font-display text-[28px] font-bold uppercase tracking-wide text-white leading-tight mb-2">{assigned.title}</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/50 mb-3">{assigned.startLocation} → {assigned.endLocation}</p>
                    <div className="flex gap-4 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">📅 {new Date(assigned.dateScheduled).toLocaleDateString()}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">📏 {assigned.distanceKm} km</span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">🏍️ {assigned.bikeRequirement}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30">Organizer</p>
                    <p className="text-[12px] font-semibold text-white/60 mt-0.5">
                      {assigned.organizer?.firstName} {assigned.organizer?.lastName}
                      {assigned.organizer?.clubAffiliation && <span className="opacity-60"> · {assigned.organizer.clubAffiliation}</span>}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[340px] relative z-10">
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#333] absolute inset-0" />
                <div className="relative z-10 text-center p-8">
                  <Trophy className="h-12 w-12 text-white/10 mx-auto mb-4" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">No ride selected</p>
                  <p className="text-[10px] text-white/20 mt-2">Choose a ride from the right panel</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Selector + Actions */}
          <div className="flex flex-col p-7 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-4 w-4 text-black/40" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Assign Hero Banner Ride</p>
            </div>

            {/* Status badge */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 mb-5 text-[10px] font-bold uppercase tracking-widest border",
              allFilled
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-amber-50 border-amber-300 text-amber-700"
            )}>
              <div className={cn("w-2 h-2 border", allFilled ? "bg-emerald-500 border-emerald-600" : "bg-amber-400 border-amber-500")} />
              {allFilled ? "✓ Hero Banner assigned — ready to save" : "Select a ride below to set the Hero Banner"}
            </div>

            {/* Ride selector */}
            <div className="mb-5">
              <label className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 mb-2 block">Select Ride</label>
              <Select
                value={draft["HERO_BANNER"] || ""}
                onValueChange={(v) => { setMsg(""); setDraft((p) => ({ ...p, HERO_BANNER: v })); }}
              >
                <SelectTrigger className="rounded-none border-black text-[11px] font-bold uppercase tracking-widest focus:ring-0 h-11 w-full focus:shadow-[3px_3px_0_#E8FF47]">
                  <SelectValue placeholder="— Select an approved ride —" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-black max-h-[260px]">
                  {approvedRides.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-[11px] font-bold uppercase tracking-widest rounded-none py-2.5">
                      <span className="flex flex-col">
                        <span>{r.title}</span>
                        <span className="text-[9px] opacity-50 font-normal normal-case tracking-normal">{r.startLocation} → {r.endLocation}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assigned ride quick info */}
            {assigned && (
              <div className="flex-1 mb-6 bg-[#F5F3EE] border border-black p-4 space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40">Currently Assigned</p>
                <p className="text-[14px] font-bold uppercase tracking-wide leading-snug">{assigned.title}</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {[
                    ["Route", `${assigned.startLocation} → ${assigned.endLocation}`],
                    ["Date", new Date(assigned.dateScheduled).toLocaleDateString()],
                    ["Skill", assigned.skillLevel],
                    ["Distance", `${assigned.distanceKm} km`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-35">{k}</p>
                      <p className="text-[11px] font-semibold">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spacer to push save button down */}
            {!assigned && <div className="flex-1" />}

            {/* Save */}
            <div className="space-y-2 pt-4 border-t border-black/10">
              <Button
                className="w-full rounded-none bg-black text-[#E8FF47] border border-black text-[11px] font-bold uppercase tracking-widest h-11 hover:bg-[#E8FF47] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onClick={save}
                disabled={!canSave}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-2" />}
                {saving ? "Saving..." : "Save Hero Banner"}
              </Button>
              {msg && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 justify-center">
                  <Check className="h-3 w-3" /> {msg}
                </p>
              )}
              {error && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 flex items-center gap-1.5 justify-center">
                  <X className="h-3 w-3" /> {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Routes Tab ───────────────────────────────────────────────────────────────

function RoutesTab({ popularRoutes = [], onAction }: { popularRoutes?: any[], onAction?: (action: "CREATE" | "DELETE", payload?: any) => Promise<void> }) {
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
    if (confirm("Are you sure you want to delete this route?") && onAction) {
      await onAction("DELETE", { id });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="rounded-none border-black shadow-none bg-white">
        <CardHeader className="border-b border-black">
          <CardTitle className="font-display text-[18px] uppercase">Add New Popular Route</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Order No (e.g. 1)" type="number" required value={form.orderNo} onChange={e => setForm({ ...form, orderNo: e.target.value })} className="rounded-none border-black focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]" />
              <Input placeholder="Title (e.g. ECR COASTAL STRETCH)" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="rounded-none border-black focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]" />
            </div>
            <Input placeholder="Place (e.g. Chennai → Mahabalipuram via East Coast Road.)" required value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} className="rounded-none border-black focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]" />
            <Input placeholder="Google Map Iframe HTML" required value={form.iframeUrl} onChange={e => setForm({ ...form, iframeUrl: e.target.value })} className="rounded-none border-black focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]" />
            <Button type="submit" disabled={loading} className="rounded-none self-start bg-[#E8FF47] text-black border border-black hover:bg-black hover:text-[#E8FF47] hover:shadow-[4px_4px_0_#E8FF47] font-bold uppercase tracking-widest text-[11px] transition-all">
              {loading ? "Adding..." : "Add Route"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="border border-black bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black hover:bg-transparent bg-black">
              {["Order", "Title", "Place", "Map Link", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {popularRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-[11px] font-bold uppercase tracking-widest opacity-30">
                  No popular routes added
                </TableCell>
              </TableRow>
            ) : popularRoutes.map(r => (
              <TableRow key={r.id} className="border-b border-black/10 hover:bg-[#F5F3EE] transition-colors">
                <TableCell className="py-3 px-4 font-bold text-[12px]">{r.orderNo}</TableCell>
                <TableCell className="py-3 px-4 text-[12px] uppercase font-bold">{r.title}</TableCell>
                <TableCell className="py-3 px-4 text-[11px]">{r.place}</TableCell>
                <TableCell className="py-3 px-4 text-[10px] opacity-50 truncate max-w-[200px]">{r.iframeUrl}</TableCell>
                <TableCell className="py-3 px-4">
                  <Button size="sm" className="rounded-none border border-black text-[10px] font-bold uppercase tracking-widest px-2 h-7" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ users, onAction }: { users: AppUser[]; onAction?: (type: string, id: string, payload?: object) => Promise<void> }) {
  const [filter, setFilter] = useState("");
  const [confirmDel, setConfirmDel] = useState<AppUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(filter.toLowerCase())
  );

  const doAction = async (key: string, type: string, id: string, payload?: object) => {
    if (!onAction) return;
    setActionLoading(key);
    await onAction(type, id, payload);
    setActionLoading(null);
  };

  return (
    <div>
      <div className="flex gap-3 mb-5 items-center flex-wrap">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 min-w-[200px] rounded-none border-black bg-white text-[13px] h-10 focus-visible:ring-0 focus-visible:border-black focus-visible:shadow-[3px_3px_0_#E8FF47]"
        />
        <div className="px-4 h-10 border border-black bg-white flex items-center text-[10px] font-bold uppercase tracking-widest opacity-50 shrink-0">
          {users.length} users
        </div>
      </div>
      <div className="border border-black bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-black hover:bg-transparent bg-black">
              {["Name", "Email", "Role", "Status", "Club", "Joined", "Actions"].map((h) => (
                <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-white py-3 px-4 h-auto">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16 text-[11px] font-bold uppercase tracking-widest opacity-30">
                  No users found
                </TableCell>
              </TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id} className={cn("border-b border-black/10 transition-colors", u.isBanned ? "bg-black/[0.02]" : "hover:bg-[#F5F3EE]")}>
                <TableCell className="py-3 px-4">
                  <p className="font-bold text-[12px] uppercase tracking-wide">{u.firstName} {u.lastName}</p>
                </TableCell>
                <TableCell className="py-3 px-4 text-[11px] opacity-60">{u.email}</TableCell>
                <TableCell className="py-3 px-4">
                  {u.role === "ADMIN" ? (
                    <Badge className="rounded-none bg-[#E8FF47] text-black border border-black text-[9px] font-bold uppercase tracking-widest">
                      <ShieldCheck className="h-2.5 w-2.5 mr-1" /> Admin
                    </Badge>
                  ) : (
                    <Badge className="rounded-none border-black text-[9px] font-bold uppercase tracking-widest">
                      User
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {u.isBanned ? (
                    <Badge variant="outline" className="rounded-none bg-red-50 text-red-700 border-red-300 text-[9px] font-bold uppercase tracking-widest">
                      <Ban className="h-2.5 w-2.5 mr-1" /> Banned
                    </Badge>
                  ) : (
                    <Badge className="rounded-none bg-emerald-50 text-emerald-700 border-emerald-300 text-[9px] font-bold uppercase tracking-widest">
                      <Check className="h-2.5 w-2.5 mr-1" /> Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4 text-[11px] opacity-50">{u.clubAffiliation || "—"}</TableCell>
                <TableCell className="py-3 px-4 text-[11px] opacity-50 whitespace-nowrap">{new Date(u.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {u.role === "USER" ? (
                      <Button size="sm" className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600" disabled={!!actionLoading} onClick={() => doAction(`promote-${u.id}`, "role", u.id, { role: "ADMIN" })}>
                        {actionLoading === `promote-${u.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ArrowUp className="h-3 w-3 mr-0.5" />Promote</>}
                      </Button>
                    ) : (
                      <Button size="sm" className="rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-600" disabled={!!actionLoading} onClick={() => doAction(`demote-${u.id}`, "role", u.id, { role: "USER" })}>
                        {actionLoading === `demote-${u.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ArrowDown className="h-3 w-3 mr-0.5" />Demote</>}
                      </Button>
                    )}
                    {u.role !== "ADMIN" && (
                      <Button size="sm" className={cn("rounded-none h-7 text-[10px] font-bold uppercase tracking-wide px-2 border", u.isBanned ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600" : "bg-red-50 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600")} disabled={!!actionLoading} onClick={() => doAction(`ban-${u.id}`, "ban", u.id, { isBanned: !u.isBanned })}>
                        {actionLoading === `ban-${u.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : u.isBanned ? <><Check className="h-3 w-3 mr-0.5" />Unban</> : <><Ban className="h-3 w-3 mr-0.5" />Ban</>}
                      </Button>
                    )}
                    <button className="rounded-none h-7 w-7 p-0 border border-gray-400 flex items-center justify-center group" disabled={u.role === "ADMIN"} title={u.role === "ADMIN" ? "Demote first" : `Delete ${u.firstName}`} onClick={() => setConfirmDel(u)}>
                      <Trash2 size={14} color="black" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <DialogContent className="rounded-none border border-black shadow-[8px_8px_0_#E8FF47] max-w-[460px] p-0">
          <DialogHeader className="border-b border-black bg-black text-white px-6 py-4">
            <DialogTitle className="font-display text-[20px] font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete User
            </DialogTitle>
            <DialogDescription className="text-white/50 text-[11px] uppercase tracking-widest">
              This action is permanent and irreversible.
            </DialogDescription>
          </DialogHeader>
          {confirmDel && (
            <div className="p-6">
              <p className="text-[13px] mb-4">
                You are about to <strong>permanently delete</strong> this account.
              </p>
              <div className="border border-black bg-[#F5F3EE] p-4 mb-6">
                <p className="font-bold text-[14px] uppercase tracking-wide">{confirmDel.firstName} {confirmDel.lastName}</p>
                <p className="text-[11px] opacity-50 mt-1">{confirmDel.email}</p>
                <div className="mt-2">
                  <Badge variant="outline" className="rounded-none border-black text-[9px] font-bold uppercase tracking-widest">{confirmDel.role}</Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-none border-black text-[11px] font-bold uppercase tracking-widest h-10 hover:bg-black/5" onClick={() => setConfirmDel(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-none bg-black text-white text-[11px] font-bold uppercase tracking-widest h-10 hover:bg-red-600 border border-black hover:border-red-600" onClick={() => { doAction(`delete-${confirmDel.id}`, "delete", confirmDel.id); setConfirmDel(null); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Confirm Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
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

  // Sync images when ride changes
  React.useEffect(() => {
    setCurrentImages(ride?.imageUrls?.map(u => u.replace(/['"]/g, '')) || []);
    setUploadFiles([]);
  }, [ride?.id]);

  const handleAction = async (action: "APPROVE" | "REJECT", slot?: string) => {
    if (!ride || !onAction) return;
    setLoadingAction(action + (slot || ""));
    await onAction(ride.id, action, slot);
    setLoadingAction(null);
  };

  // DELETE one image by removing from currentImages and saving
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
      alert('Delete failed. Are you logged in as admin?');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ADD images (append to existing)
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
      alert('Image upload failed. Are you logged in as admin?');
    } finally {
      setUploadLoading(false);
    }
  };
  return (
    <Dialog open={!!ride} onOpenChange={onClose}>
      <DialogContent className="rounded-none border border-black shadow-[12px_12px_0_#E8FF47] max-w-[700px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-black bg-black text-white px-7 py-5 sticky top-0 z-10">
          <DialogTitle className="font-display text-[24px] font-bold uppercase tracking-wide text-white">
            {ride?.title}
          </DialogTitle>
          <DialogDescription className="text-white/40 text-[10px] uppercase tracking-widest">
            Ride Submission Details
          </DialogDescription>
        </DialogHeader>
        {ride && (
          <div className="p-7">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-7">
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
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 mb-1.5">{label}</p>
                  <p className="text-[14px] font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mb-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 mb-2">Skill Level</p>
              <SkillBadge level={ride.skillLevel} />
            </div>
            {/* Image gallery with delete */}
            <div className="mb-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 mb-2">Ride Images {currentImages.length > 0 && <span className="opacity-60">({currentImages.length})</span>}</p>
              {currentImages.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {currentImages.map((url, i) => (
                    <div key={i} className="relative shrink-0 group">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} crossOrigin="anonymous" alt={`Ride image ${i + 1}`} className="h-[120px] w-auto max-w-[200px] object-cover border border-black snap-center group-hover:opacity-70 transition-opacity" />
                      </a>
                      <button
                        type="button"
                        disabled={deleteLoading}
                        onClick={() => handleDeleteImage(i)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-black text-white w-5 h-5 flex items-center justify-center text-[11px] font-bold border border-white/20 transition-colors disabled:opacity-40"
                        title="Delete image"
                      >
                        {deleteLoading ? '…' : '×'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-black/20 py-6 text-center text-[11px] opacity-30 uppercase tracking-widest">No images yet</div>
              )}
            </div>

            {/* Add Images */}
            <div className="mb-7 border border-dashed border-black/30 p-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-40 mb-3">Add More Images</p>
              <div className="flex gap-3 flex-wrap items-start">
                <div className="flex-1">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg, image/png, image/webp"
                    onChange={e => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files);
                        setUploadFiles(prev => [...prev, ...files].slice(0, 10));
                        e.target.value = '';
                      }
                    }}
                    className="w-full text-[11px] border border-black px-2 py-1.5 cursor-pointer file:mr-3 file:py-1 file:px-2 file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-black file:text-white hover:file:bg-[#E8FF47] hover:file:text-black"
                  />
                  {uploadFiles.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {uploadFiles.map((f, i) => (
                        <div key={i} className="relative w-12 h-12 border border-black overflow-hidden shrink-0">
                          <img src={URL.createObjectURL(f)} alt={`preview ${i}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 flex items-center justify-center text-[10px]">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={uploadFiles.length === 0 || uploadLoading}
                  onClick={handleImageUpload}
                  className="rounded-none h-9 text-[10px] font-bold uppercase tracking-widest px-4 bg-black text-[#E8FF47] border border-black hover:bg-[#E8FF47] hover:text-black shrink-0"
                >
                  {uploadLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Upload'}
                </Button>
              </div>
            </div>
            <Separator className="bg-black mb-6" />
            <div className="flex gap-3 flex-wrap">
              <Button
                disabled={!!loadingAction}
                className="flex-1 min-w-[120px] rounded-none bg-white text-black border border-black text-[11px] font-bold uppercase tracking-widest h-11 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300"
                onClick={() => handleAction("APPROVE")}
              >
                {loadingAction === "APPROVE" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-2" />} Approve
              </Button>
              <Button
                disabled={!!loadingAction}
                className="flex-1 min-w-[120px] rounded-none bg-[#E8FF47] text-black border border-black text-[11px] font-bold uppercase tracking-widest h-11 hover:bg-black hover:text-[#E8FF47]"
                onClick={() => handleAction("APPROVE", "HERO_BANNER")}
              >
                {loadingAction === "APPROVEHERO_BANNER" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Star className="h-3.5 w-3.5 mr-2" />} Feature
              </Button>
              <Button
                disabled={!!loadingAction}
                className="flex-1 min-w-[120px] rounded-none bg-white text-black border border-black text-[11px] font-bold uppercase tracking-widest h-11 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
                onClick={() => handleAction("REJECT")}
              >
                {loadingAction === "REJECT" ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <X className="h-3.5 w-3.5 mr-2" />} Reject
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────


const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1', withCredentials: true });

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // --- Real Data States ---
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
      // Fetch metrics & activities
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

      // Fetch Rides
      const [pendRides, appRides, rejRides] = await Promise.all([
        api.get('/admin/submissions/rides?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/rides?status=APPROVED').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/rides?status=REJECTED').catch(() => ({ data: { data: [] } })),
      ]);
      setPendingRides(pendRides.data?.data || []);
      setApprovedRides(appRides.data?.data || []);
      setRejectedRides(rejRides.data?.data || []);

      // Fetch Stories
      const [pendStories, appStories, rejStories] = await Promise.all([
        api.get('/admin/submissions/stories?status=PENDING').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/stories?status=APPROVED').catch(() => ({ data: { data: [] } })),
        api.get('/admin/submissions/stories?status=REJECTED').catch(() => ({ data: { data: [] } })),
      ]);
      setPendingStories(pendStories.data?.data || []);
      setApprovedStories(appStories.data?.data || []);
      setRejectedStories(rejStories.data?.data || []);

      // Fetch Users
      const usersRes = await api.get('/admin/users').catch(() => ({ data: { data: [] } }));
      setUsers(usersRes.data?.data || []);

      // Fetch Popular Routes
      const routesRes = await api.get('/public/popular-routes').catch(() => ({ data: { data: [] } }));
      setPopularRoutes(routesRes.data?.data || []);

      // Fetch Claims
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
      alert("Failed to perform action. Check console.");
    }
  };

  const handleStoryAction = async (id: string, action: "APPROVE" | "REJECT" | "PENDING") => {
    try {
      await api.post(`/admin/submissions/stories/${id}/review`, { action });
      await fetchAdminData();
    } catch (err) {
      console.error("Story action failed", err);
      alert("Failed to perform story action. Check console.");
    }
  };

  const handleUserAction = async (type: string, id: string, payload?: object) => {
    try {
      if (type === "role") {
        await api.post(`/admin/users/${id}/role`, payload);
      } else if (type === "ban") {
        await api.post(`/admin/users/${id}/ban`, payload);
      } else if (type === "delete") {
        await api.delete(`/admin/users/${id}`);
      }
      await fetchAdminData();
    } catch (err) {
      console.error("User action failed", err);
      alert("Failed to perform user action. Check console.");
    }
  };

  const handleFeaturedSave = async (slots: { rideId: string; slot: string }[]) => {
    await api.put('/admin/content/featured', { slots });
    await fetchAdminData();
  };

  const handlePopularRouteAction = async (action: "CREATE" | "DELETE", payload?: any) => {
    try {
      if (action === "CREATE") {
        await api.post('/admin/popular-routes', payload);
      } else if (action === "DELETE") {
        await api.delete(`/admin/popular-routes/${payload.id}`);
      }
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
    <div className="flex min-h-screen bg-[#F5F3EE] text-black font-body">
      {/* Desktop sidebar */}
      <DesktopSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        active={activeTab}
        setActive={setActiveTab}
        metrics={metrics}
      />

      {/* Mobile sidebar (Sheet) */}
      <MobileSidebar
        open={mobileSidebarOpen}
        setOpen={setMobileSidebarOpen}
        active={activeTab}
        setActive={setActiveTab}
        metrics={metrics}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar active={activeTab} onMenuClick={handleMenuClick} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden relative">

          {isLoading && (
            <div className="absolute inset-0 bg-[#F5F3EE]/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="font-display text-[24px] uppercase tracking-widest text-black animate-pulse">Loading Data...</div>
            </div>
          )}

          {activeTab === "dashboard" && (
            <DashboardTab
              metrics={metrics}
              pendingRides={pendingRides}
              approvedRides={approvedRides}
              activities={activities}
              setActiveTab={setActiveTab}
              setSelectedRide={setSelectedRide}
              onAction={handleRideAction}
            />
          )}
          {activeTab === "rides" && (
            <RidesTab
              pendingRides={pendingRides}
              approvedRides={approvedRides}
              rejectedRides={rejectedRides}
              setSelectedRide={setSelectedRide}
              onAction={handleRideAction}
            />
          )}
          {activeTab === "stories" && (
            <StoriesTab
              pendingStories={pendingStories}
              approvedStories={approvedStories}
              rejectedStories={rejectedStories}
              onAction={handleStoryAction}
            />
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

      <RideDetailModal
        ride={selectedRide}
        onClose={() => setSelectedRide(null)}
        onAction={handleRideAction}
      />
    </div>
  );
}

function ClaimsTab({ claims }: { claims: any[] }) {
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

  if (claims.length === 0) return <div className="p-8 text-center text-gray-500 font-display">NO CLAIMS YET</div>;

  if (selectedClaim) {
    return (
      <div className="space-y-6 animate-in fade-in bg-white border-2 border-black shadow-[8px_8px_0_var(--color-accent)] p-8">
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8">
          <Button variant="outline" size="sm" onClick={() => setSelectedClaim(null)} className="font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
            <ChevronLeft size={16} className="mr-2" /> Back to Claims
          </Button>
          <div className="text-right">
            <h2 className="font-display text-3xl uppercase tracking-widest text-black mb-1">
              Order #{selectedClaim.orderNumber}
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Claim Details</p>
          </div>
        </div>

        {/* Customer & Claim Meta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 pb-8 border-b border-gray-200">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div>
                <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-2">Claim Type</span>
                <Badge variant={selectedClaim.claimType === 'WARRANTY' ? 'danger' : selectedClaim.claimType === 'RETURN' ? 'neutral' : 'info'} className="uppercase px-4 py-1.5">
                  {selectedClaim.claimType}
                </Badge>
              </div>
              <div>
                <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-2">Status</span>
                <Badge className="uppercase px-4 py-1.5 bg-black text-black">
                  {selectedClaim.status || "PENDING"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div><span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Date Submitted</span><span className="font-medium">{new Date(selectedClaim.createdAt).toLocaleDateString()}</span></div>
              <div><span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Purchase Date</span><span className="font-medium">{selectedClaim.purchaseDate ? new Date(selectedClaim.purchaseDate).toLocaleDateString() : 'N/A'}</span></div>
              <div className="col-span-2"><span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Customer Name</span><span className="font-medium">{selectedClaim.customerName}</span></div>
              <div><span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Email Address</span><span className="font-medium">{selectedClaim.email}</span></div>
              <div><span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">WhatsApp Phone</span><span className="font-medium">{selectedClaim.phone}</span></div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Addresses */}
            {(selectedClaim.billingAddress || selectedClaim.shippingAddress) && (
              <div className="bg-gray-50 p-6 border border-gray-200 space-y-6 h-full">
                {selectedClaim.billingAddress && (
                  <div>
                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-2">Billing Address</span>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">{selectedClaim.billingAddress}</p>
                  </div>
                )}
                {selectedClaim.shippingAddress && (
                  <div>
                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-2">Shipping Address</span>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-medium">{selectedClaim.shippingAddress}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="pb-8 border-b border-gray-200">
          <span className="font-display uppercase tracking-widest text-black text-[18px] block mb-6">Product Details</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Main Product (Warranty/Return) OR Returning Product (Exchange) */}
            <div className="bg-white border-2 border-black p-6 relative">
              <span className="absolute -top-3 left-4 bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                {selectedClaim.claimType === 'EXCHANGE' ? 'Returning Product' : 'Product Info'}
              </span>
              <div className="mt-2">
                <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Product Name</span>
                <span className="font-semibold text-[16px] block mb-4">
                  {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductName : selectedClaim.productName}
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Color</span>
                    <span className="font-medium text-[14px]">
                      {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductColor : selectedClaim.productColor}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-widest text-gray-500 text-[10px] block mb-1">Size</span>
                    <span className="font-medium text-[14px]">
                      {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductSize : selectedClaim.productSize}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Product (Only for Exchange) */}
            {selectedClaim.claimType === 'EXCHANGE' && (
              <div className="bg-[#E8FF47]/20 border-2 border-black p-6 relative">
                <span className="absolute -top-3 left-4 bg-black text-[#E8FF47] text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                  Exchange For
                </span>
                <div className="mt-2">
                  <span className="font-bold uppercase tracking-widest text-gray-600 text-[10px] block mb-1">Product Name</span>
                  <span className="font-semibold text-[16px] block mb-4">
                    {selectedClaim.exchangeProductName}
                  </span>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold uppercase tracking-widest text-gray-600 text-[10px] block mb-1">Color</span>
                      <span className="font-medium text-[14px]">{selectedClaim.exchangeProductColor}</span>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-widest text-gray-600 text-[10px] block mb-1">Size</span>
                      <span className="font-medium text-[14px]">{selectedClaim.exchangeProductSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Reason */}
        <div className="pb-8 border-b border-gray-200">
          <span className="font-display uppercase tracking-widest text-black text-[18px] block mb-6">Reason / Description</span>
          <p className="whitespace-pre-wrap leading-relaxed text-[15px] bg-gray-50 p-6 border border-gray-200 font-sans">{selectedClaim.reason}</p>
        </div>

        {/* Media */}
        <div>
          <span className="font-display uppercase tracking-widest text-black text-[18px] block mb-6">Attached Media</span>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Invoice */}
            <div className="shrink-0">
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-4">Invoice Document</span>
              {selectedClaim.invoiceUrl ? (
                <a href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}${selectedClaim.invoiceUrl}`} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center justify-center border-2 border-black bg-black text-white p-6 hover:bg-white hover:text-black transition-colors w-48 h-48 group">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 group-hover:scale-110 transition-transform"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-center">VIEW INVOICE<br />PDF/IMAGE</span>
                </a>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest text-center p-4">No Invoice<br />Attached</div>
              )}
            </div>

            {/* Product Media */}
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest block mb-4">Product Images/Videos</span>
              {selectedClaim.productMediaUrls && selectedClaim.productMediaUrls.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {selectedClaim.productMediaUrls.map((url: string, idx: number) => {
                    const isVideo = url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.mov') || url.toLowerCase().endsWith('.avi');
                    const fullUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}${url}`;
                    return isVideo ? (
                      <a key={idx} href={fullUrl} target="_blank" rel="noreferrer" className="flex flex-col shrink-0 border-2 border-black p-4 hover:bg-black hover:text-white transition-colors items-center justify-center gap-2 h-48 w-48 bg-gray-50 group">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:scale-110 transition-transform"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        <span className="text-[11px] font-bold uppercase tracking-widest">PLAY VIDEO</span>
                      </a>
                    ) : (
                      <a key={idx} href={fullUrl} target="_blank" rel="noreferrer" className="shrink-0 relative group block h-48 w-48 border-2 border-black overflow-hidden bg-gray-100">
                        <img src={fullUrl} alt="media" className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest transition-opacity shadow-lg">View</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest w-full">
                  No product media attached
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-widest text-black mb-1">Gear Claims</h2>
          <p className="text-sm font-sans text-gray-500">Manage warranty, returns, and exchanges.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[8px_8px_0_var(--color-accent)] overflow-hidden">
        <Table>
          <TableHeader className="bg-black">
            <TableRow className="hover:bg-black">
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4">Order #</TableHead>
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4">Date</TableHead>
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4">Customer</TableHead>
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4">Type</TableHead>
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4">Status</TableHead>
              <TableHead className="text-white font-display tracking-widest text-[11px] py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => (
              <TableRow key={claim.id} className="border-b border-gray-200">
                <TableCell className="font-bold text-[13px]">{claim.orderNumber}</TableCell>
                <TableCell className="text-[12px] opacity-70">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-[12px] opacity-70">{claim.customerName}</TableCell>
                <TableCell>
                  <Badge variant={claim.claimType === 'WARRANTY' ? 'danger' : claim.claimType === 'RETURN' ? 'neutral' : 'info'} className="uppercase">
                    {claim.claimType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="uppercase opacity-60">
                    {claim.status || "PENDING"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="action-vw" size="sm" onClick={() => setSelectedClaim(claim)}>
                    <Eye size={14} className="mr-2" /> View Full Data
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}