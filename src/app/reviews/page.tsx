"use client";

import React, { useState, useEffect } from 'react';
import { UserNavbar } from '@/components/layout/UserNavbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

import { Upload, message, Image, Carousel } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api/v1', withCredentials: true });



const CARD_COLORS = [
  'from-[#1a1a2e] to-[#16213e]',
  'from-[#0f3460] to-[#533483]',
  'from-[#1b262c] to-[#0f3460]',
  'from-[#2d1b69] to-[#11998e]',
  'from-[#200122] to-[#6f0000]',
  'from-[#0f0c29] to-[#302b63]',
  'from-[#134e5e] to-[#71b280]',
  'from-[#373b44] to-[#4286f4]',
];

const EMOJIS = ['🌊', '🌄', '🌙', '🏕️', '🏔️', '🌅', '⚡', '🛣️'];

export default function ReviewsForumPage() {
  const [activeSort, setActiveSort] = useState('Hot');
  const [activeNav, setActiveNav] = useState('All Reviews');
  const [isJoined, setIsJoined] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [flairType, setFlairType] = useState('rev');
  const [ratingScore, setRatingScore] = useState(0);

  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/public/stories?postType=STORY'),
      api.get('/public/stories?postType=REVIEW')
    ]).then(([storiesRes, reviewsRes]) => {
      setStories(storiesRes.data?.data || []);
      setReviews(reviewsRes.data?.data || []);
    }).catch(() => { });
  }, []);

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

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center text-gray-400 hover:text-black transition-colors">
      <PlusOutlined />
      <div className="text-[10px] mt-1 font-semibold uppercase tracking-[0.05em]">Upload</div>
    </div>
  );

  // Left Nav items
  const navSections = [
    {
      title: 'Categories',
      items: [
        { name: 'All Reviews', icon: '📝', count: '1.2K' },
        { name: 'All Stories', icon: '🗺️', count: '458' },
      ]
    }
  ];

  const getFlairVariant = (type: string) => {
    switch (type) {
      case 'adv': return 'advanced';
      case 'int': return 'info';
      case 'rev': return 'accent';
      case 'tip': return 'outline';
      case 'gear': return 'neutral';
      default: return 'outline';
    }
  };

  const isStoriesView = activeNav === 'All Stories';

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-x-clip">
      <UserNavbar activePath="/reviews" showSearch={true} ctaText="Write a Review" />

      {/* BANNER */}
      <div className="bg-black border-b-[3px] border-accent p-0">
        <div className="h-[120px] bg-[repeating-linear-gradient(45deg,#111_0px,#111_10px,#161616_10px,#161616_20px)] relative overflow-hidden flex items-center pr-10">
          <div className="ml-auto font-display text-[clamp(48px,6vw,80px)] tracking-[0.05em] text-white/5 whitespace-nowrap hidden sm:block">RIDE REVIEWS</div>
        </div>
        <div className="max-w-[1440px] auto px-6 pb-5 flex items-end gap-5 mx-auto">
          <div className="w-[72px] h-[72px] bg-accent border-[3px] border-accent flex items-center justify-center text-[32px] shrink-0 -mt-7 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            🏍️
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-[28px] tracking-[0.04em] uppercase text-white leading-none mb-1">Rimoto Ride Reviews</h1>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40">r/rimotoreviews • Community since 2024</div>
          </div>
        </div>
      </div>

      {/* BAR */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-1 h-[46px] overflow-x-auto">
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className={`max-w-[1440px] mx-auto px-6 py-6 w-full grid gap-4 items-start ${isStoriesView
        ? 'grid-cols-1 md:grid-cols-[200px_1fr]'
        : 'grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_312px]'
        }`}>

        {/* LEFT NAV */}
        <aside className="sticky top-[110px] hidden md:flex flex-col gap-[2px]">
          {navSections.map((sec, i) => (
            <React.Fragment key={sec.title}>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-300 px-3 pt-3.5 pb-1.5">{sec.title}</div>
              {sec.items.map(item => (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all border outline-none cursor-pointer w-full text-left ${activeNav === item.name ? 'text-black bg-accent border-accent font-bold' : 'text-gray-400 border-transparent bg-transparent hover:text-black hover:bg-white hover:border-border'}`}
                >
                  <span className="text-[14px] shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                  {item.count && <span className={`ml-auto text-[10px] font-bold ${activeNav === item.name ? 'text-black' : 'text-gray-300'}`}>{item.count}</span>}
                </button>
              ))}
              {i < navSections.length - 1 && <div className="h-[1px] bg-border my-1.5" />}
            </React.Fragment>
          ))}
        </aside>

        {/* ── STORIES VIEW ─────────────────────────────────────────── */}
        {isStoriesView ? (
          <main>
            {/* Section header */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-2">From The Road</p>
                <h2 className="font-display text-[clamp(28px,4vw,44px)] tracking-[0.02em] uppercase leading-none text-black">
                  RIDE <b>STORIES</b>
                </h2>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">{stories.length} stories</span>
            </div>

            {/* Stories grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[2px]">
              {stories.length === 0 && (
                <div className="col-span-4 py-20 text-center text-[12px] font-bold uppercase tracking-[0.15em] opacity-30">
                  No stories yet — check back soon.
                </div>
              )}
              {stories.map((story, i) => (
                <div
                  key={story.id}
                  className="bg-white border text-left border-border overflow-hidden transition-all duration-200 cursor-pointer hover:border-black hover:shadow-[4px_4px_0_var(--color-accent)] flex flex-col"
                >
                  {/* Card thumbnail */}
                  <div className={`h-[300px] overflow-hidden relative bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]}`}>
                    {story.images && story.images.length > 0 ? (
                      <img src={`http://localhost:4000${story.images[0]}`} alt="Story cover" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-[52px]">
                        {EMOJIS[i % EMOJIS.length]}
                      </div>
                    )}
                    {story.destinationTag && (
                      <div className="absolute bottom-3 left-3 bg-accent text-black text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 z-10">
                        {story.destinationTag}
                      </div>
                    )}
                    {story.flairType && (
                      <div className="absolute top-3 right-3 bg-black text-white text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 z-10">
                        {story.flairType.replace(/_/g, ' ')}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display text-[17px] tracking-[0.03em] uppercase text-black mb-2 leading-[1.15]">
                      {story.title}
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-[1.7] mb-3.5 flex-1 line-clamp-3">
                      {story.contentBody?.slice(0, 160)}...
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                        By <span className="text-black ml-1">{story.author?.firstName} {story.author?.lastName}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black border-b border-black pb-[1px] hover:border-accent cursor-pointer">
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {stories.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="ghost" className="border border-border-d text-gray-400 hover:text-black px-10">
                  Load More Stories
                </Button>
              </div>
            )}
          </main>

        ) : (
          /* ── REVIEWS / FORUM VIEW ────────────────────────────────── */
          <>
            <main className="flex flex-col gap-[2px]">
              {/* CREATE POST */}
              {!isCreatingPost ? (
                <div className="bg-white border text-left border-border p-3.5 px-4 flex items-center gap-3 mb-[2px] transition-colors hover:border-border-d cursor-pointer" onClick={() => setIsCreatingPost(true)}>
                  <div className="w-9 h-9 bg-border flex items-center justify-center shrink-0">👤</div>
                  <input type="text" placeholder="Share a route, tip, or review..." className="flex-1 bg-white border border-border-d text-black font-sans text-[12px] px-3.5 py-2.5 outline-none transition-colors focus:border-black placeholder:text-gray-400 cursor-pointer" readOnly />
                  <Button className="hidden sm:inline-flex" size="sm">Post</Button>
                </div>
              ) : (
                <div className="bg-white border text-left border-border p-4 flex flex-col gap-3 mb-[2px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-border flex items-center justify-center shrink-0">👤</div>
                    <div className="text-[12px] font-bold text-black uppercase tracking-[0.05em]">Create Post</div>
                  </div>
                  <input
                    type="text"
                    placeholder="Post Title..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-white border border-border-d text-black font-sans text-[14px] px-3.5 py-2.5 outline-none transition-colors focus:border-black placeholder:text-gray-400"
                  />
                  <textarea
                    placeholder="Share your experience, route details, or review..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-2.5 outline-none transition-colors focus:border-black placeholder:text-gray-400 min-h-[100px] resize-y"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Destination or Route (e.g., ECR, Yelagiri)"
                      value={destinationTag}
                      onChange={(e) => setDestinationTag(e.target.value)}
                      className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-2.5 outline-none transition-colors focus:border-black placeholder:text-gray-400"
                    />
                    <select
                      value={flairType}
                      onChange={(e) => setFlairType(e.target.value)}
                      className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-2.5 outline-none transition-colors focus:border-black"
                    >
                      <option value="rev">Review</option>
                      <option value="tip">Tips & Tricks</option>
                      <option value="adv">Adventure</option>
                      <option value="gear">Gear</option>
                      <option value="int">Info</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold uppercase tracking-[0.05em]">Rating:</span>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={ratingScore}
                      onChange={(e) => setRatingScore(parseFloat(e.target.value))}
                      className="w-20 bg-white border border-border-d text-black font-sans text-[13px] px-2 py-1 outline-none transition-colors focus:border-black"
                    />
                  </div>
                  <div className="mt-1">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={handlePreview}
                      onChange={handleUploadChange}
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
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsCreatingPost(false)}>Cancel</Button>
                    <Button size="sm" onClick={async () => {
                      if (!postTitle || !postContent || !destinationTag || !flairType) {
                        message.error('Please enter title, content, destination, and flair.');
                        return;
                      }

                      const formData = new FormData();
                      formData.append('title', postTitle);
                      formData.append('contentBody', postContent);
                      formData.append('destinationTag', destinationTag);
                      formData.append('flairType', flairType);
                      formData.append('ratingScore', ratingScore.toString());
                      formData.append('postType', 'REVIEW');

                      fileList.forEach((file) => {
                        if (file.originFileObj) {
                          formData.append('images', file.originFileObj);
                        }
                      });

                      try {
                        await api.post('/public/stories', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        message.success('Post created successfully!');
                        setIsCreatingPost(false);
                        setPostTitle('');
                        setPostContent('');
                        setDestinationTag('');
                        setFlairType('rev');
                        setRatingScore(0);
                        setFileList([]);

                        // Refresh reviews
                        const res = await api.get('/public/stories?postType=REVIEW');
                        setReviews(res.data?.data || []);
                      } catch (err) {
                        message.error('Failed to create post. Are you logged in?');
                      }
                    }}>Submit Post</Button>
                  </div>
                </div>
              )}

              {/* POSTS LIST */}
              {reviews.map(post => (
                <div key={post.id} className={`bg-white border text-left border-border flex transition-all duration-200 cursor-pointer group hover:border-black hover:shadow-[3px_3px_0_var(--color-accent)] ${post.isPinned ? 'border-l-[3px] border-l-accent' : ''}`}>

                  {/* Vote Col */}
                  <div className="w-11 bg-white flex flex-col items-center py-2.5 gap-1 border-r border-border shrink-0">
                    <button className="w-7 h-7 bg-transparent border-none outline-none cursor-pointer flex items-center justify-center text-[16px] text-gray-400 transition-colors hover:text-black hover:bg-gray-100 p-0">▲</button>
                    <div className="text-[11px] font-bold text-black tracking-[0.02em]">{post.voteCount || 0}</div>
                    <button className="w-7 h-7 bg-transparent border-none outline-none cursor-pointer flex items-center justify-center text-[16px] text-gray-400 transition-colors hover:text-black hover:bg-gray-100 p-0">▼</button>
                  </div>

                  {/* POST BODY */}
                  <div className="flex-1 p-3.5 px-4 pb-3 min-w-0 flex flex-col w-full max-w-[800px]">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {post.isPinned && <span className="bg-accent text-black text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 inline-block">PINNED</span>}
                      <Badge variant={getFlairVariant(post.flairType)} size="xs" className="border-transparent">
                        {post.flairType.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Posted by <strong className="text-black">{post.author?.firstName} {post.author?.lastName}</strong></div>
                      <span className="text-border-d text-[10px]">•</span>
                      <div className="text-[10px] text-gray-300 font-medium">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>

                    <h3 className="font-display text-[20px] tracking-[0.03em] uppercase text-black leading-[1.1] mb-2 transition-colors group-hover:text-black/80">{post.title}</h3>

                    {post.ratingScore > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-[11px] font-bold text-black tracking-[0.05em]">{post.ratingScore}</span>
                        <span className="text-[13px] text-accent">★</span>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5">
                      <span className="text-accent">📍</span> {post.destinationTag}
                    </div>

                    <p className="text-[13px] text-text-2 leading-[1.65] mb-2.5 line-clamp-3 overflow-hidden">{post.contentBody}</p>

                    {post.images && post.images.length > 0 && (
                      <div className="mb-3 border border-border relative overflow-hidden bg-gray-50">
                        <Carousel swipeToSlide draggable className="h-full">
                          {post.images.map((imgUrl: string, idx: number) => (
                            <div key={idx} className="h-[300px] w-full">
                              <img src={`http://localhost:4000${imgUrl}`} alt="Post image" className="w-full h-full object-cover pointer-events-none" />
                            </div>
                          ))}
                        </Carousel>
                      </div>
                    )}

                    <div className="flex items-center gap-3.5 flex-wrap mt-auto pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 hover:bg-gray-100 cursor-pointer p-1 -ml-1">
                        💬 Comments
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 hover:bg-gray-100 cursor-pointer p-1">
                        ↗ Share
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="mt-4 border border-border-d text-gray-400 hover:text-black">Load More</Button>
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sticky top-[110px] hidden lg:flex flex-col gap-[2px]">
              <div className="bg-white border border-border overflow-hidden">
                <div className="p-3.5 px-4 bg-black flex items-center justify-between">
                  <h3 className="font-display text-[18px] tracking-[0.05em] uppercase text-white">About Community</h3>
                </div>
                <div className="p-4">
                  <p className="text-[12px] text-gray-400 leading-[1.75] mb-3.5">The official forum for Rimoto riders in Chennai. Share route conditions, post detailed ride reviews, trade gear advice, and connect with fellow enthusiasts.</p>
                  <Button className="w-full">CREATE POST</Button>
                </div>
              </div>

              <div className="bg-white border border-border overflow-hidden mt-4 p-4 text-center">
                <div className="font-display text-[24px] text-black mb-2 leading-none">GEAR THAT <br /><span className="bg-accent px-1">CARRIES LEGACY</span></div>
                <p className="text-[11px] text-gray-400 mb-4 uppercase tracking-[0.05em]">Shop the latest collection.</p>
                <Button variant="ghost" className="border border-black w-full">Shop Now</Button>
              </div>
            </aside>
          </>
        )}

      </div>
    </div>
  );
}

