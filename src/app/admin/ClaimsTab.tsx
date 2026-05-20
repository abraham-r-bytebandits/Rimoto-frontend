"use client";

import { useState } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ClaimsTab({ claims }: { claims: any[] }) {
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  if (claims.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-16 flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold text-gray-400">No claims yet</p>
      </div>
    );
  }

  if (selectedClaim) {
    return (
      <div className="space-y-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedClaim(null)} className="h-10 rounded-lg">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Claims
          </Button>
          <span className="text-xs font-bold text-gray-450 uppercase tracking-widest">Document View</span>
        </div>

        {/* Minimalist Corporate Document Container */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm max-w-4xl mx-auto overflow-hidden relative">

          {/* Document Header Section */}
          <div className="px-10 pt-10 pb-8 border-b border-gray-250 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">RIMOTO GEAR SYSTEM</p>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">Gear Claim Document</h2>
              <p className="text-xs text-gray-400 mt-1">ID: {selectedClaim.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-left md:text-right flex flex-col md:items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-bold text-gray-800 uppercase tracking-wider">
                  {selectedClaim.status || "PENDING"}
                </span>
              </div>
              <p className="text-sm text-gray-900 font-extrabold mt-3 md:mt-0">Order: #{selectedClaim.orderNumber}</p>
            </div>
          </div>

          {/* Customer & Claim Metadata Blocks */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-b border-gray-200">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-155 pb-2 mb-3">Customer Information</h4>
              <div className="space-y-2.5">
                <p className="text-gray-900 font-extrabold text-base leading-none">{selectedClaim.customerName}</p>
                <p className="text-gray-700 leading-none">
                  <span className="font-semibold text-gray-400 text-xs uppercase mr-2.5">Email:</span>
                  {selectedClaim.email}
                </p>
                <p className="text-gray-700 leading-none">
                  <span className="font-semibold text-gray-400 text-xs uppercase mr-2.5">Phone:</span>
                  {selectedClaim.phone}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-155 pb-2 mb-3">Claim Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-gray-400 uppercase">Date Submitted</span>
                  <p className="font-extrabold text-gray-900 text-sm mt-1">{new Date(selectedClaim.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-400 uppercase">Purchase Date</span>
                  <p className="font-extrabold text-gray-900 text-sm mt-1">
                    {selectedClaim.purchaseDate ? new Date(selectedClaim.purchaseDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-gray-400 uppercase">Claim Type</span>
                  <p className="mt-1.5">
                    <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-0.5 text-xs font-bold text-gray-800 uppercase tracking-wide">
                      {selectedClaim.claimType}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Address Panels */}
            {(selectedClaim.billingAddress || selectedClaim.shippingAddress) && (
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                {selectedClaim.billingAddress && (
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Billing Address</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150 font-medium">
                      {selectedClaim.billingAddress}
                    </p>
                  </div>
                )}
                {selectedClaim.shippingAddress && (
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping Address</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-150 font-medium">
                      {selectedClaim.shippingAddress}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Line Item Invoice Table */}
          <div className="px-10 pb-6 pt-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Claimed Items Specs</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-gray-50 text-[10px] uppercase tracking-wider">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 pl-6 py-3">Purpose</TableHead>
                    <TableHead className="font-bold text-gray-700 py-3">Product Name</TableHead>
                    <TableHead className="font-bold text-gray-700 py-3">Color</TableHead>
                    <TableHead className="font-bold text-gray-700 pr-6 py-3 text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {/* Returning Row */}
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="font-extrabold text-gray-900 pl-6 py-4">
                      {selectedClaim.claimType === 'EXCHANGE' ? 'RETURNING' : 'CLAIMED'}
                    </TableCell>
                    <TableCell className="font-extrabold text-gray-900 py-4">
                      {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductName : selectedClaim.productName}
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium py-4">
                      {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductColor : selectedClaim.productColor}
                    </TableCell>
                    <TableCell className="font-extrabold text-gray-900 pr-6 py-4 text-right">
                      {selectedClaim.claimType === 'EXCHANGE' ? selectedClaim.returningProductSize : selectedClaim.productSize}
                    </TableCell>
                  </TableRow>
                  {/* Exchange Item Row */}
                  {selectedClaim.claimType === 'EXCHANGE' && (
                    <TableRow className="hover:bg-transparent border-t border-gray-150 bg-gray-50/30">
                      <TableCell className="font-extrabold text-gray-900 pl-6 py-4">
                        DESIRED EXCHANGE
                      </TableCell>
                      <TableCell className="font-extrabold text-gray-900 py-4">
                        {selectedClaim.exchangeProductName}
                      </TableCell>
                      <TableCell className="text-gray-600 font-medium py-4">
                        {selectedClaim.exchangeProductColor}
                      </TableCell>
                      <TableCell className="font-extrabold text-gray-900 pr-6 py-4 text-right">
                        {selectedClaim.exchangeProductSize}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Return Reason Message Box */}
          <div className="px-10 pb-8 pt-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-3">Justification Note</h4>
            <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
              {selectedClaim.reason}
            </div>
          </div>

          {/* Attached Supporting Documents */}
          <div className="px-10 pb-10 border-t border-gray-200 pt-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-3">Supporting Documents</h4>
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Purchase Invoice</span>
                {selectedClaim.invoiceUrl ? (
                  <a
                    href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}${selectedClaim.invoiceUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors gap-2 bg-white shadow-sm font-bold text-xs text-gray-700 uppercase tracking-wide"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    View Attached Invoice
                  </a>
                ) : (
                  <div className="border border-gray-200 rounded-xl px-4 py-3 text-center text-xs text-gray-400 bg-gray-50">No invoice attached</div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2.5">Media Evidence</span>
                {selectedClaim.productMediaUrls?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedClaim.productMediaUrls.map((url: string, idx: number) => {
                      const isVideo = url.toLowerCase().match(/\.(mp4|mov|avi)$/);
                      const fullUrl = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}${url}`;
                      return isVideo ? (
                        <button
                          key={idx}
                          onClick={() => setSelectedVideo(fullUrl)}
                          className="flex items-center justify-center border border-gray-200 rounded-xl px-4 py-3 gap-2 hover:bg-gray-50 bg-white font-bold text-xs text-gray-700 shadow-sm uppercase tracking-wide"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          Play Video Evidence
                        </button>
                      ) : (
                        <a
                          key={idx}
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-16 h-16 rounded-xl overflow-hidden border border-gray-200 hover:opacity-85 hover:shadow-sm transition-all"
                        >
                          <img src={fullUrl} alt="Evidence Attachment" className="w-full h-full object-cover" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl px-4 py-3 text-center text-xs text-gray-400 bg-gray-50">No media attached</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none">
              <video src={selectedVideo} controls autoPlay className="w-full h-auto max-h-[85vh] object-contain outline-none" />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gear Claims</h2>
        <p className="text-sm text-gray-500 mt-1">Manage warranty, returns, and exchanges.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 hover:bg-gray-200 text-xs uppercase tracking-wider">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-gray-900 pl-6">Order #</TableHead>
                <TableHead className="font-semibold text-gray-900">Date</TableHead>
                <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                <TableHead className="font-semibold text-gray-900">Type</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-right text-gray-900 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {claims.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <TableCell className="font-bold text-gray-900 pl-6">#{claim.orderNumber}</TableCell>
                  <TableCell className="text-gray-600 whitespace-nowrap">{new Date(claim.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-gray-900 whitespace-nowrap">{claim.customerName}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 uppercase tracking-wide">
                      {claim.claimType}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
                      claim.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                        : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                    )}>
                      {claim.status || "PENDING"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black border-none">
            <video src={selectedVideo} controls autoPlay className="w-full h-auto max-h-[85vh] object-contain outline-none" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
