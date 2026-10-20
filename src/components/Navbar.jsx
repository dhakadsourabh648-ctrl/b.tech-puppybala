import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Menu, X, Sparkles } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function Navbar({ onOpenEnquiry }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Puppies', path: '/puppies' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact & Enquiry', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/90 shadow-xs">
      {/* Top micro-bar with gentle pulse */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-50 text-xs py-1.5 px-4 text-center font-medium shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-semibold tracking-wide">Serving Bhopal, Indore, Sehore & Nearby MP Cities</span>
          </span>
          <span className="hidden sm:inline text-amber-200">|</span>
          <span className="hidden sm:inline text-amber-100 font-medium">
            🎁 FREE Welcome Kit (7 Days Food + Belt + Shampoo) with every puppy!
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with playful click scale & rotation */}
          <Link
            to="/"
            onClick={(e) => triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)')}
            className="flex items-center gap-3 group active:scale-95 active:rotate-[-2deg] transition-transform duration-200"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-md shadow-amber-500/20 group-hover:scale-105 group-hover:border-amber-500 group-hover:shadow-amber-500/40 transition-all bg-black shrink-0">
              <img
                src="/logo.png"
                alt="B.tech Puppybala Official Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display group-hover:text-amber-700 transition-colors">
                  B.tech <span className="text-amber-600">Puppybala</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Bhopal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Happy Pups • Happier Families
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links with tactile click bounce & ripple */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)')}
                  className={`nav-link-tactile px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
                    active
                      ? 'text-amber-900 bg-amber-100/90 border border-amber-300/80 shadow-xs'
                      : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 border border-transparent'
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse shrink-0" />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action buttons with click ripple, tactile bounce & shimmer */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about available puppies.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerClickRipple(e, 'rgba(16, 185, 129, 0.35)')}
              className="btn-tactile glow-emerald animate-icon-pop flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 shadow-xs hover:shadow-md transition-all"
              title={`WhatsApp Us at ${CONTACT_CONFIG.whatsappDisplay}`}
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600 transition-transform duration-200" />
              <span>WhatsApp Us</span>
            </a>

            <button
              onClick={(e) => {
                triggerClickRipple(e, 'rgba(255, 255, 255, 0.6)');
                if (onOpenEnquiry) onOpenEnquiry(null);
              }}
              className="btn-tactile shimmer-sweep glow-amber flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-600 rounded-xl shadow-md shadow-amber-500/30 hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Enquire Now</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </button>
          </div>

          {/* Mobile WhatsApp Quick Button & Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about available puppies.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerClickRipple(e, 'rgba(16, 185, 129, 0.35)')}
              className="btn-tactile glow-emerald flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-[11px] shadow-xs"
              title="WhatsApp Us"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-tactile p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 transition-transform rotate-90" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with tactile links */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-amber-100 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-3">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => {
                    triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)');
                    setMobileMenuOpen(false);
                  }}
                  className={`nav-link-tactile px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between ${
                    active
                      ? 'text-amber-800 bg-amber-100/90 font-bold border border-amber-200'
                      : 'text-slate-700 hover:bg-amber-50/70'
                  }`}
                >
                  <span>{link.name}</span>
                  {active && <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />}
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={(e) => {
                triggerClickRipple(e, 'rgba(255, 255, 255, 0.6)');
                setMobileMenuOpen(false);
                if (onOpenEnquiry) onOpenEnquiry(null);
              }}
              className="btn-tactile shimmer-sweep glow-amber w-full py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow-md cursor-pointer"
            >
              Quick Enquiry Form
            </button>
            <a
              href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about available puppies.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.4)')}
              className="btn-tactile glow-emerald w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Us ({CONTACT_CONFIG.whatsappDisplay})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
