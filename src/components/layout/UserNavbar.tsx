"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface UserNavbarProps {
  activePath?: string;
  showSearch?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function UserNavbar({ activePath = '/community', showSearch = false, ctaText = 'Register Your Ride', onCtaClick }: UserNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 bg-white border-b-2 border-black`}>
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a href="/" className="font-display text-[26px] tracking-[0.08em] text-black no-underline shrink-0 flex">
            <img src="/logo.svg" alt="logo" />
          </a>

          <ul className={`hidden md:flex gap-7 list-none items-center ${showSearch ? 'ml-auto' : 'flex-1 justify-center'}`}>
            <li>
              <a href="https://rimotogear.com" target="_blank" className="font-sans text-black text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors whitespace-nowrap">Shop Gear ↗</a>
            </li>
            <li>
              <a href="/" className={`font-sans text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${activePath === '/' ? 'text-black border-b-2 border-accent pb-0.5' : 'text-black hover:text-black'}`}>
                Ride Board
              </a>
            </li>
            <li>
              <a href="/reviews" className={`font-sans text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${activePath === '/reviews' ? 'text-black border-b-2 border-accent pb-0.5' : 'text-black hover:text-black'}`}>Forum</a>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em]">{user.firstName || user.email}</span>
                <Button onClick={logout} variant="ghost" className="border border-1 border-black hover:bg-black hover:text-white px-3 py-2 text-[10px]" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} variant="ghost" className="border border-1 border-black hover:bg-black hover:text-white px-4 py-2 text-[11px]" size="sm">
                Login
              </Button>
            )}
            <Button onClick={onCtaClick} className="bg-black text-black hover:bg-accent hover:text-black px-5 py-2 text-[11px]" size="md">
              {ctaText}
            </Button>
          </div>

          <button className="md:hidden bg-transparent border-none p-1.5 cursor-pointer text-black" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b-2 border-black z-[49] p-4 px-5 flex flex-col">
          <a href="https://rimotogear.com" target="_blank" className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted decoration-none py-3 border-b border-border hover:text-black">Shop Gear ↗</a>
          <a href="/" className={`text-[11px] font-semibold uppercase tracking-[0.15em] decoration-none py-3 border-b border-border hover:text-black ${activePath === '/' ? 'text-black' : ''}`}>Ride Board</a>
          <a href="/reviews" className={`text-[11px] font-semibold uppercase tracking-[0.15em] decoration-none py-3 border-b border-border hover:text-black ${activePath === '/reviews' ? 'text-black' : ''}`}>Forum</a>
          <button onClick={() => { setMobileMenuOpen(false); onCtaClick?.(); }} className="mt-3 bg-black text-white text-center p-3 font-bold cursor-pointer border-none font-sans text-[11px] tracking-[0.15em] uppercase hover:bg-accent hover:text-black transition-colors">
            {ctaText}
          </button>
        </div>
      )}
    </>
  );
}
