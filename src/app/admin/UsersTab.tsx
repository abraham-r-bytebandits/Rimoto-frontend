"use client";

import { useState } from "react";
import {
  Check,
  Ban,
  Trash2,
  ArrowUp,
  ArrowDown,
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AppUser } from "./types";

// ─── Users Tab ────────────────────────────────────────────────────────────────

export function UsersTab({
  users,
  onAction
}: {
  users: AppUser[];
  onAction?: (type: string, id: string, payload?: object) => Promise<void>;
}) {
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
      <div className="flex gap-4 mb-6 items-center flex-wrap">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name or email..."
          className="max-w-xs"
        />
        <span className="inline-flex items-center justify-center rounded-full bg-[#D4E048]/20 px-3.5 py-1 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-[#D4E048]/40">
          {users.length} users
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 pl-6">Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Email</TableHead>
                <TableHead className="font-semibold text-gray-900">Role</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Club</TableHead>
                <TableHead className="font-semibold text-gray-900">Joined</TableHead>
                <TableHead className="font-semibold text-right text-gray-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="font-medium text-gray-900 pl-6">{u.firstName} {u.lastName}</TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          <ShieldCheck className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 ring-1 ring-inset ring-gray-600/10">
                          User
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                          <Ban className="h-3.5 w-3.5" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <Check className="h-3.5 w-3.5" /> Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">{u.clubAffiliation || "—"}</TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">{new Date(u.joinedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right pr-6 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {u.role === "USER" ? (
                          <button
                            disabled={!!actionLoading}
                            onClick={() => doAction(`promote-${u.id}`, "role", u.id, { role: "ADMIN" })}
                            className="inline-flex items-center justify-center rounded-md text-xs font-bold bg-[#D4E048] px-3 py-1.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-colors gap-1.5 uppercase tracking-wide shadow-sm"
                          >
                            {actionLoading === `promote-${u.id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <ArrowUp className="h-3.5 w-3.5" /> Promote
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            disabled={!!actionLoading}
                            onClick={() => doAction(`demote-${u.id}`, "role", u.id, { role: "USER" })}
                            className="inline-flex items-center justify-center rounded-md text-xs font-bold border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors gap-1.5 uppercase tracking-wide"
                          >
                            {actionLoading === `demote-${u.id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <ArrowDown className="h-3.5 w-3.5" /> Demote
                              </>
                            )}
                          </button>
                        )}
                        {u.role !== "ADMIN" && (
                          <button
                            disabled={!!actionLoading}
                            onClick={() => doAction(`ban-${u.id}`, "ban", u.id, { isBanned: !u.isBanned })}
                            className="inline-flex items-center justify-center rounded-md text-xs font-bold border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors gap-1.5 uppercase tracking-wide"
                          >
                            {actionLoading === `ban-${u.id}` ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.isBanned ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-3.5 w-3.5" /> Ban
                              </>
                            )}
                          </button>
                        )}
                        <button
                          disabled={u.role === "ADMIN"}
                          onClick={() => setConfirmDel(u)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 font-bold">
              <Trash2 className="h-5 w-5 text-red-500" /> Delete User
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              This action is permanent and cannot be undone. Are you sure you want to remove this user?
            </DialogDescription>
          </DialogHeader>
          {confirmDel && (
            <div className="space-y-5">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <p className="font-bold text-gray-900">{confirmDel.firstName} {confirmDel.lastName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{confirmDel.email}</p>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 uppercase mt-2">
                  {confirmDel.role}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDel(null)}
                  className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold border border-gray-300 bg-white py-2.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { doAction(`delete-${confirmDel.id}`, "delete", confirmDel.id); setConfirmDel(null); }}
                  className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-red-600 py-2.5 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors gap-1.5 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
