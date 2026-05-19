"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserNavbar } from '@/components/layout/UserNavbar';
import Footer from '@/components/layout/Footer';
import { Waves, Sunrise, Moon, Tent, Mountain, Sun, Zap, Route, Circle, Star, Calendar, Bike, Ruler, MessageCircle, Clock, MapPin } from 'lucide-react';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1', withCredentials: true });

const CARD_COLORS = [
  'from-[#dbeef8] to-[#b8ddf0]', 'from-[#f5ede0] to-[#e8d5b0]',
  'from-[#ede0f5] to-[#d5c8e8]', 'from-[#e0f0e8] to-[#c5ddd0]',
  'from-[#d4edda] to-[#a8d5b5]', 'from-[#fde8b0] to-[#f7c875]',
];
const EMOJIS = [<Waves size={48} className="text-gray-700" key="waves" />, <Sunrise size={48} className="text-gray-700" key="sunrise" />, <Moon size={48} className="text-gray-700" key="moon" />, <Tent size={48} className="text-gray-700" key="tent" />, <Mountain size={48} className="text-gray-700" key="mountain" />, <Sun size={48} className="text-gray-700" key="sun" />, <Zap size={48} className="text-gray-700" key="zap" />, <Route size={48} className="text-gray-700" key="route" />];
const skillColor = (s: string) => {
  if (s === 'BEGINNER') return <Circle className="w-2.5 h-2.5 text-green-500 fill-green-500" />;
  if (s === 'INTERMEDIATE') return <Circle className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />;
  return <Circle className="w-2.5 h-2.5 text-red-500 fill-red-500" />;
};

export default function CommunityPage() {
  const [filter, setFilter] = useState('All Rides');
  const [showRideModal, setShowRideModal] = useState(false);
  const [rides, setRides] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any | null>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [form, setForm] = useState({
    clubAffiliation: '', organizerName: '', title: '', startLocation: '',
    endLocation: '', dateScheduled: '', timeStart: '', skillLevel: 'BEGINNER',
    bikeRequirement: 'All Bikes', whatsappGroupUrl: '', distanceKm: '',
  });
  const [images, setImages] = useState<File[]>([]);  // kept for type safety, unused in submission

  const skillMap: Record<string, string> = { 'All Rides': '', 'Beginner': 'BEGINNER', 'Night Rides': '', 'Hill Climbs': 'ADVANCED' };

  const fetchData = useCallback(async () => {
    try {
      const skillLevel = skillMap[filter] || '';
      const [ridesRes, featuredRes, storiesRes, routesRes] = await Promise.all([
        api.get(`/public/rides${skillLevel ? `?skill_level=${skillLevel}` : ''}`),
        api.get('/public/rides/featured'),
        api.get('/public/stories?postType=STORY&limit=3'),
        api.get('/public/popular-routes'),
      ]);
      setRides(ridesRes.data?.data || []);
      const featuredList: any[] = featuredRes.data?.data || [];
      setFeatured(featuredList.find((r: any) => r.featuredSlot === 'HERO_BANNER') || featuredList[0] || null);
      setStories(storiesRes.data?.data || []);
      const routesData = routesRes.data?.data || [];
      setPopularRoutes(routesData);
      if (routesData.length > 0) setSelectedRoute(routesData[0]);
    } catch (e) { console.error(e); }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleJoin = async (ride: any) => {
    try {
      const res = await api.post(`/public/rides/${ride.id}/join`);
      if (res.data?.whatsappGroupUrl) window.open(res.data.whatsappGroupUrl, '_blank');
    } catch { window.open(ride.whatsappGroupUrl, '_blank'); }
  };

  const openModal = () => { setShowRideModal(true); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setShowRideModal(false); document.body.style.overflow = ''; setSubmitMsg(''); };

  const handleSubmitRide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('startLocation', form.startLocation);
      formData.append('endLocation', form.endLocation);
      formData.append('dateScheduled', form.dateScheduled);
      formData.append('timeStart', form.timeStart);
      formData.append('distanceKm', (parseFloat(form.distanceKm) || 0).toString());
      formData.append('skillLevel', form.skillLevel);
      formData.append('bikeRequirement', form.bikeRequirement);
      formData.append('whatsappGroupUrl', form.whatsappGroupUrl);

      await api.post('/public/rides', formData);
      setSubmitMsg('✓ Submitted! Admin will review within 24 hours.');
      setTimeout(closeModal, 2500);
    } catch (err: any) {
      setSubmitMsg('✕ ' + (err?.response?.data?.error || 'Submission failed. Try again.'));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <UserNavbar activePath="/" ctaText="+ List a Ride" onCtaClick={openModal} />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-[56px] w-full">
        {/* RIDE BOARD HERO SECTION */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2">Upcoming Rides</p>
            <h2 className="font-display text-[clamp(32px,4vw,52px)] tracking-[0.02em] uppercase leading-none text-black">
              RIDE <b>BOARD</b>
            </h2>
          </div>
          <a href="#" className="text-[11px] font-bold uppercase tracking-[0.15em] text-black no-underline border-b-2 border-black pb-0.5 transition-colors hover:border-accent whitespace-nowrap">View All Rides →</a>
        </div>

        {/* RIDES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured */}
          {featured && (
            <div className="bg-black !border-black min-h-[280px] grid grid-cols-1 md:grid-cols-2 col-span-1 md:col-span-2 lg:col-span-3 transition-colors hover:shadow-[4px_4px_0_var(--color-accent)] cursor-pointer">
              <div className="bg-gradient-to-br from-[#222] to-[#111] flex items-center justify-center text-[80px] text-gray-600 relative overflow-hidden h-[190px] md:h-auto">
                {featured.imageUrls && featured.imageUrls.length > 0 ? (
                  <img src={featured.imageUrls[0].replace(/['"]/g, '')} crossOrigin="anonymous" alt={featured.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <Mountain size={80} className="text-gray-600" />
                )}
                <div className="absolute top-4 left-4 bg-accent text-black text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 z-10 flex items-center gap-1.5"><Star size={10} className="fill-black" /> {featured.featuredSlot?.replace(/_/g, ' ') || 'Featured'}</div>
              </div>
              <div className="p-9 flex flex-col justify-center text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-3.5">{featured.startLocation} → {featured.endLocation}</p>
                <h3 className="font-display text-[30px] tracking-[0.03em] uppercase text-white mb-1.5 leading-none">{featured.title}</h3>
                <div className="flex flex-wrap gap-3 mt-4 mb-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45 flex items-center gap-1"><Calendar size={12} /> {new Date(featured.dateScheduled).toLocaleDateString()}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45 flex items-center gap-1.5">{skillColor(featured.skillLevel)} {featured.skillLevel}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45 flex items-center gap-1"><Bike size={12} /> {featured.bikeRequirement}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45 flex items-center gap-1"><Ruler size={12} /> {featured.distanceKm} km</div>
                </div>
                <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">By <span className="text-white/65">{featured.organizer?.clubAffiliation || `${featured.organizer?.firstName} ${featured.organizer?.lastName}`}</span></div>
                  <button onClick={() => handleJoin(featured)} className="bg-white text-black text-[10px] font-bold uppercase tracking-[0.15em] px-3.5 py-2 hover:bg-accent transition-colors flex items-center gap-1.5 border-none cursor-pointer"><MessageCircle size={14} className="fill-black text-black" /> Join on WhatsApp</button>
                </div>
              </div>
            </div>
          )}

          {rides.length === 0 && !featured && (
            <div className="col-span-3 py-20 text-center text-[12px] font-bold uppercase tracking-[0.15em] opacity-30">Loading rides...</div>
          )}

          {rides.map((ride, i) => (
            <div key={ride.id} className="bg-white border text-left border-border overflow-hidden transition-all duration-200 cursor-pointer hover:border-black hover:shadow-[4px_4px_0_var(--color-accent)] group">
              <div className="h-[250px] overflow-hidden relative">
                <div className={`w-full h-full flex items-center justify-center font-display bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]}`}>
                  {ride.imageUrls && ride.imageUrls.length > 0 ? (
                    <img src={ride.imageUrls[0].replace(/['"]/g, '')} crossOrigin="anonymous" alt={ride.title} className="w-full h-full object-cover" />
                  ) : (
                    EMOJIS[i % EMOJIS.length]
                  )}
                </div>
                <div className={`absolute top-3 left-3 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] z-10 flex items-center gap-1.5 ${ride.skillLevel === 'ADVANCED' ? 'bg-black text-white' : ride.skillLevel === 'INTERMEDIATE' ? 'bg-[#555] text-white' : 'bg-accent text-black'}`}>
                  {skillColor(ride.skillLevel)} {ride.skillLevel}
                </div>
                <div className="absolute top-3 right-3 bg-black text-white text-[9px] font-semibold uppercase tracking-[0.1em] px-2.5 py-1 z-10">{new Date(ride.dateScheduled).toLocaleDateString()}</div>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600 mb-3.5">{ride.startLocation} → {ride.endLocation}</p>
                <h3 className="font-display text-[22px] tracking-[0.03em] uppercase text-black mb-1.5 leading-none">{ride.title}</h3>
                <div className="flex gap-3 mb-4 flex-wrap mt-4">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600"><Clock size={12} /> {ride.timeStart}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600"><Bike size={12} /> {ride.bikeRequirement}</div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600"><Ruler size={12} /> {ride.distanceKm} km</div>
                </div>
                <div className="flex items-center justify-between pt-3.5 border-t border-border mt-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600">By <span className="text-text-2">{ride.organizer?.clubAffiliation || `${ride.organizer?.firstName} ${ride.organizer?.lastName}`}</span></div>
                  <button onClick={() => handleJoin(ride)} className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3.5 py-2 border-none cursor-pointer transition-colors hover:bg-accent hover:text-black flex items-center gap-1.5"><MessageCircle size={14} className="fill-current" /> Join</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* STORIES SECTION */}
        <div className="mt-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 mb-2">From The Road</p>
              <h2 className="font-display text-[clamp(32px,4vw,52px)] tracking-[0.02em] uppercase leading-none text-black">
                RIDE <b>STORIES</b>
              </h2>
            </div>
            <a href="/reviews" className="text-[11px] font-bold uppercase tracking-[0.15em] text-black no-underline border-b-2 border-black pb-0.5 transition-colors hover:border-accent whitespace-nowrap">All Stories →</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
            {stories.length === 0 && <div className="col-span-4 py-16 text-center text-[12px] font-bold uppercase tracking-[0.15em] opacity-30">Loading stories...</div>}
            {stories.map((story, i) => (
              <div key={story.id} className="bg-white border text-left border-border overflow-hidden transition-all duration-200 cursor-pointer hover:border-black hover:shadow-[4px_4px_0_var(--color-accent)] flex flex-col">
                <div className={`h-[250px] overflow-hidden relative bg-gradient-to-br ${CARD_COLORS[i % CARD_COLORS.length]}`}>
                  {story.images && story.images.length > 0 ? (
                    <img src={`${story.images[0]}`} alt="Story cover" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">{EMOJIS[i % EMOJIS.length]}</div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-accent text-black text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 z-10">{story.destinationTag}</div>
                  {story.flairType && <div className="absolute top-3 right-3 bg-black text-white text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-1 z-10">{story.flairType.replace(/_/g, ' ')}</div>}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display text-[19px] tracking-[0.03em] uppercase text-black mb-2 leading-[1.15]">{story.title}</h3>
                  <p className="text-[12px] text-gray-600 leading-[1.7] mb-3.5 flex-1">{story.contentBody?.slice(0, 160)}...</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-600">By <span className="text-black ml-1">{story.author?.firstName} {story.author?.lastName}</span></div>
                    <a href="/reviews" className="text-[10px] font-bold uppercase tracking-[0.15em] text-black no-underline border-b border-black pb-[1px] hover:border-accent">Read →</a>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/*POPULAR ROUTES MAP */}
        <div className="mt-14 pt-14 border-t border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600 mb-2">Explore Routes</p>
              <h2 className="font-display text-[clamp(32px,4vw,52px)] tracking-[0.02em] uppercase leading-none text-black">
                POPULAR <b>ROUTES</b>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-start">
            <div className="flex flex-col gap-[2px]">
              {popularRoutes.length === 0 && <div className="py-16 text-center text-[12px] font-bold uppercase tracking-[0.15em] opacity-30">Loading routes...</div>}
              {popularRoutes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoute(r)}
                  className={`bg-white border p-[18px] px-5 flex items-center gap-4 cursor-pointer transition-all hover:border-black hover:shadow-[3px_3px_0_var(--color-accent)] ${selectedRoute?.id === r.id ? 'border-black shadow-[3px_3px_0_var(--color-accent)]' : 'border-border'}`}
                >
                  <div className="font-display text-[28px] text-gray-600 min-w-[40px] opacity-40">{r.orderNo.toString().padStart(2, '0')}</div>
                  <div className="flex-1 text-left">
                    <div className="font-display text-[18px] tracking-[0.03em] uppercase text-black mb-1">{r.title}</div>
                    <div className="text-[11px] text-gray-600 leading-[1.5]">{r.place}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-border h-[440px] relative overflow-hidden flex items-center justify-center p-2">
              {selectedRoute?.iframeUrl ? (
                <div dangerouslySetInnerHTML={{ __html: selectedRoute.iframeUrl }} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none" />
              ) : (
                <div className="text-[12px] font-bold uppercase tracking-[0.15em] opacity-30">No Map Available</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CTA BANNER */}
      <div className="bg-black py-[80px] px-10 text-center">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="font-display text-[clamp(36px,5vw,72px)] tracking-[0.02em] uppercase text-white mb-1.5">
            ORGANISE A <b className="text-accent font-normal">RIDE</b>
          </h2>
          <p className="text-[13px] text-white/45 mb-7">Got a route? Build a crew. Submit your ride and let the community find you.</p>
          <button onClick={openModal} className="bg-accent text-black text-[11px] font-bold uppercase tracking-[0.2em] px-[36px] py-[14px] hover:bg-accent-d transition-colors cursor-pointer border-none gap-2 flex items-center mx-auto">
            + Submit Your Ride
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />

      {/* WHATSAPP FLOAT */}
      <a href="#" className="fixed bottom-7 right-7 z-50 bg-wa text-white w-[52px] h-[52px] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] cursor-pointer transition-transform hover:scale-110 no-underline rounded-none">
        <MessageCircle size={24} className="fill-white" />
      </a>

      {/* SUBMIT RIDE MODAL */}
      {showRideModal && (
        <div
          className="fixed inset-0 bg-black/55 z-[200] flex items-center justify-center p-5"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white border border-border-d w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-[8px_8px_0_var(--color-accent)]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-border bg-black flex items-center justify-between">
              <h3 className="font-display text-[28px] uppercase tracking-[0.04em] text-white">List a Ride</h3>
              <button onClick={closeModal} className="bg-transparent border-none text-white/40 text-[20px] cursor-pointer hover:text-accent transition-colors">✕</button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitRide} className="p-8">
              {/* Info note */}
              <p className="text-[11px] text-gray-600 leading-[1.7] mb-5 bg-white px-3.5 py-3 border-l-[3px] border-accent">
                Your ride goes to admin for review. Published within 24 hours once approved.
              </p>

              {/* Row: Biker Group + Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Biker Group *</label>
                  <input type="text" required placeholder="e.g. Chennai Riders Collective" value={form.clubAffiliation} onChange={e => setForm(f => ({ ...f, clubAffiliation: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Organizer Name *</label>
                  <input type="text" required placeholder="Your name" value={form.organizerName} onChange={e => setForm(f => ({ ...f, organizerName: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
              </div>

              {/* Ride Name */}
              <div className="mb-[18px]">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Ride Name *</label>
                <input type="text" required placeholder="e.g. ECR Sunday Blitz" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
              </div>

              {/* Row: Starting Point + Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Starting Point *</label>
                  <input type="text" required placeholder="e.g. Chennai - Marina Beach" value={form.startLocation} onChange={e => setForm(f => ({ ...f, startLocation: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Destination *</label>
                  <input type="text" required placeholder="e.g. Mahabalipuram" value={form.endLocation} onChange={e => setForm(f => ({ ...f, endLocation: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
              </div>

              {/* Row: Ride Date + Start Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Ride Date *</label>
                  <input type="date" required value={form.dateScheduled} onChange={e => setForm(f => ({ ...f, dateScheduled: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black cursor-pointer" />
                </div>
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Start Time *</label>
                  <input type="time" required value={form.timeStart} onChange={e => setForm(f => ({ ...f, timeStart: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black cursor-pointer" />
                </div>
              </div>

              {/* Row: Skill Level + Bike Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Skill Level *</label>
                  <select required value={form.skillLevel} onChange={e => setForm(f => ({ ...f, skillLevel: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black cursor-pointer">
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Bike Type</label>
                  <select value={form.bikeRequirement} onChange={e => setForm(f => ({ ...f, bikeRequirement: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black cursor-pointer">
                    <option>All Bikes</option>
                    <option>150cc+</option>
                    <option>250cc+</option>
                    <option>500cc+</option>
                    <option>Royal Enfield Only</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp + Distance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">WhatsApp Group Link *</label>
                  <input type="url" required placeholder="https://chat.whatsapp.com/..." value={form.whatsappGroupUrl} onChange={e => setForm(f => ({ ...f, whatsappGroupUrl: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
                <div className="mb-[18px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-[7px] block">Distance (km)</label>
                  <input type="number" placeholder="e.g. 120" value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} className="w-full bg-white border border-border-d text-black font-sans text-[13px] px-3.5 py-[11px] outline-none transition-colors focus:border-black placeholder:text-gray-600" />
                </div>
              </div>

              {/* Submit */}
              {submitMsg && <p className={`text-[12px] font-bold uppercase tracking-[0.1em] mb-3 ${submitMsg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>{submitMsg}</p>}
              <button type="submit" disabled={submitting} className="w-full bg-black text-white text-[12px] font-bold uppercase tracking-[0.2em] py-4 border-none cursor-pointer mt-2 transition-colors hover:bg-accent hover:text-black disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit for Review →'}
              </button>
              <p className="text-[10px] text-gray-600 text-center mt-3 leading-[1.6]">Reviewed by admin. Confirmation via WhatsApp within 24 hours.</p>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
