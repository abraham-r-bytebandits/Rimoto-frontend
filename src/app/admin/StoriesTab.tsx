"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, message, Image, Carousel } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  BookOpen,
  X,
  Check,
  Ban,
  RotateCcw,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Story } from "./types";
import { SubTabs } from "./page";

// ─── Stories Tab (with Create Story Modal) ────────────────────────────────────

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
    <div className="flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
      <PlusOutlined />
      <div className="text-sm mt-1 font-medium">Upload</div>
    </div>
  );

  const handleSubmit = async () => {
    if (!postTitle || !postContent || !destinationTag || !flairType) {
      message.error('Please fill in all fields.');
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
      if (file.originFileObj) formData.append('images', file.originFileObj);
    });
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'}/public/stories`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success('Story created!');
      onClose();
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      message.error('Failed to create story.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Admin Story</DialogTitle>
          <DialogDescription>Upload a new story with multiple images</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Input placeholder="Story Title..." value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Destination (e.g. Ooty)" value={destinationTag} onChange={(e) => setDestinationTag(e.target.value)} />
            <select
              value={flairType}
              onChange={(e) => setFlairType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
          />
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
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Posting...' : 'Create Story'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function StoriesTab({
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
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex gap-6">
          <button
            onClick={() => setPostType("REVIEW")}
            className={cn(
              "font-semibold text-lg transition-colors",
              postType === "REVIEW" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-gray-600"
            )}
          >
            User Reviews
          </button>
          <button
            onClick={() => setPostType("STORY")}
            className={cn(
              "font-semibold text-lg transition-colors",
              postType === "STORY" ? "text-black border-b-2 border-black pb-1" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Official Stories
          </button>
        </div>
        {postType === "STORY" && (
          <Button onClick={() => setIsCreateOpen(true)}>+ Create Story</Button>
        )}
      </div>

      <CreateStoryModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <SubTabs tabs={["pending", "approved", "rejected"]} active={sub} setActive={setSub} counts={{ pending: storyMap.pending.length }} />

      {storyMap[sub].length === 0 ? (
        <div className="rounded-xl border bg-white p-16 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400">No {sub} {postType.toLowerCase()}s</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {storyMap[sub].map((story) => (
            <div
              key={story.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="w-full">
                    <div className="flex justify-between items-center w-full mb-2">
                      <span className="inline-flex items-center rounded-full bg-[#D4E048]/20 px-2.5 py-0.5 text-xs font-semibold text-gray-900 ring-1 ring-inset ring-[#D4E048]/30 uppercase tracking-wider">
                        {story.flairType.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-lg leading-snug text-gray-900 line-clamp-2 mt-1">
                      {story.title}
                    </h4>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1.5">
                      By {story.author.firstName} {story.author.lastName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 flex-1 flex flex-col">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md w-fit mb-3">
                  📍 {story.destinationTag}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">
                  {story.contentBody}
                </p>

                {story.images && story.images.length > 0 && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                    <Carousel swipeToSlide draggable>
                      {story.images.map((imgUrl, idx) => (
                        <div key={idx} className="h-48 w-full">
                          <img src={imgUrl} alt="Story" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </Carousel>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 pb-6 pt-3 border-t border-gray-100 mt-auto bg-gray-50/50">
                {sub === "pending" && (
                  <div className="flex gap-2.5">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => handleAction(story.id, "APPROVE")}
                      className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-[#D4E048] py-2.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-all gap-1.5 shadow-sm"
                    >
                      {actionLoading === `APPROVE-${story.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" /> Approve
                        </>
                      )}
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => handleAction(story.id, "REJECT")}
                      className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-red-50 px-3.5 py-2.5 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-all border border-red-100"
                    >
                      {actionLoading === `REJECT-${story.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                {sub === "rejected" && (
                  <button
                    disabled={!!actionLoading}
                    onClick={() => handleAction(story.id, "APPROVE")}
                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-[#D4E048] py-2.5 text-black hover:bg-[#c2ce3f] focus:outline-none focus:ring-2 focus:ring-[#D4E048] disabled:opacity-50 transition-all gap-1.5 shadow-sm"
                  >
                    {actionLoading === `APPROVE-${story.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" /> Re-approve
                      </>
                    )}
                  </button>
                )}

                {sub === "approved" && (
                  <div className="flex flex-col gap-3 w-full">
                    <span className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-50 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5" /> Live
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={!!actionLoading}
                        onClick={() => handleAction(story.id, "REJECT")}
                        className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-red-50 py-2 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50 transition-all border border-red-100 gap-1.5"
                      >
                        <Ban className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button
                        disabled={!!actionLoading}
                        onClick={() => handleAction(story.id, "PENDING")}
                        className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-semibold border border-gray-300 bg-white py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-all gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Pending
                      </button>
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
