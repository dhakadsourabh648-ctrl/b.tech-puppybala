import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ArrowRight, ShieldCheck, MapPin, MessageCircle, PawPrint, PhoneCall } from 'lucide-react';
import PuppyCard from '../components/PuppyCard';
import TrustSection from '../components/TrustSection';
import OffersBanner from '../components/OffersBanner';
import HowItWorks from '../components/HowItWorks';
import { PUPPIES, getFeaturedPuppies } from '../data/puppiesData';
import { getPuppies, getOffers } from '../services/api';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function HomePage({ onOpenEnquiry }) {
  const [puppies, setPuppies] = useState(() => getFeaturedPuppies(6));
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    document.title = 'B.tech Puppybala | Home-Raised Puppies in Bhopal & MP';
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [apiPuppies, apiOffers] = await Promise.all([getPuppies(), getOffers()]);
        if (isMounted) {
          if (Array.isArray(apiPuppies)) {
            const availableOnly = apiPuppies.filter((p) => p.status === 'Available' || p.availability === 'Available');
            setPuppies(availableOnly.slice(0, 6));
          }
          if (Array.isArray(apiOffers)) {
            setActiveOffers(apiOffers);
          } else if (apiOffers && typeof apiOffers === 'object') {
            setActiveOffers([apiOffers]);
          } else {
            setActiveOffers([]);
          }
        }
      } catch (err) {
        // Fallback to local data is already handled in api.js
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 hero-gradient border-b border-amber-100/60">
        {/* Background decorative circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold shadow-xs">
                <PawPrint className="w-4 h-4 text-amber-600" />
                <span>Bhopal’s Trusted Home-Raised Puppy Haven</span>
              </div>

              {/* Main Headings */}
              <div className="space-y-2">
                <p className="text-base sm:text-lg font-bold text-amber-700 tracking-wider uppercase font-display">
                  B.tech Puppybala
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-display leading-[1.15]">
                  Find Your <span className="text-gradient">Perfect Puppy</span>
                </h1>
              </div>

              {/* Subheading from requirement */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Home-raised puppies for loving families in Bhopal and nearby cities.
              </p>

              {/* Quick highlights */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-100 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Cage-Free Home Environment
                </span>
                <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-100 shadow-xs">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Bhopal & Nearby Delivery
                </span>
                {activeOffers.length > 0 && (
                  <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-100 shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {activeOffers[0].title} Included
                  </span>
                )}
              </div>

              {/* CTAs with tactile click animations */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  to="/puppies"
                  onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.6)')}
                  className="btn-tactile shimmer-sweep glow-amber w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-xl transition-all"
                >
                  <span>Explore Puppies</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  onClick={(e) => {
                    triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)');
                    if (onOpenEnquiry) onOpenEnquiry(null);
                  }}
                  className="btn-tactile w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-amber-50/80 text-slate-800 font-bold text-base rounded-2xl border border-amber-200/90 shadow-soft hover:shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-amber-600" />
                  <span>Send Quick Enquiry</span>
                </button>
              </div>

              {/* Active Offer Tagline */}
              {activeOffers.length > 0 && (
                <div className="pt-2 text-xs text-amber-800/90 font-medium flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    Active Special: {activeOffers[0].title}
                    {activeOffers[0].highlightText ? ` • ${activeOffers[0].highlightText}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Photo */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 h-[380px] sm:h-[460px] w-full">
                  <img
                    src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=85"
                    alt="Cute Golden Retriever puppy in Bhopal"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                  {/* Float card over image */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-amber-100 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          Bhopal Home-Raised
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-base mt-1">
                          Meet "Leo" (Golden Retriever)
                        </h4>
                        <p className="text-xs text-slate-500">50 Days • Sweet & Family-Friendly</p>
                      </div>
                      <Link
                        to="/puppies/pb-01"
                        className="px-3.5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating badge 1: 60+ Customers */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl p-3.5 shadow-xl border border-amber-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Heart className="w-5 h-5 fill-amber-600 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">60+ Adoptions</p>
                    <p className="text-[10px] text-slate-500 font-medium">Bhopal & MP Families</p>
                  </div>
                </div>

                {/* Floating badge: Official B.tech Puppybala Emblem Seal */}
                <div className="absolute -top-6 -right-4 sm:-right-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black ring-4 ring-amber-400/50 z-20 hover:scale-105 transition-transform" title="Official B.tech Puppybala Seal">
                  <img
                    src="/logo.png"
                    alt="B.tech Puppybala Official Seal"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating badge 2: Zero cages */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3.5 shadow-xl border border-amber-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Zero Cages</p>
                    <p className="text-[10px] text-slate-500 font-medium">100% Home Environment</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. DYNAMIC OFFERS SECTION (FREE Welcome Kit) */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <OffersBanner
            offers={activeOffers}
            onOpenEnquiry={onOpenEnquiry}
          />
        </section>
      )}

      {/* 3. AVAILABLE PUPPIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
              Ready for Loving Homes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-2">
              Available Puppies
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Meet our gentle, home-nurtured puppies ready to bring unconditional joy to your family.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <a
              href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about available puppies.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp Us</span>
            </a>
            <Link
              to="/puppies"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors px-3 py-2 bg-amber-50 rounded-xl border border-amber-200/80"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Puppies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {puppies.map((puppy) => (
            <PuppyCard
              key={puppy.id || puppy._id}
              puppy={puppy}
              onOpenEnquiry={onOpenEnquiry}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/puppies"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all hover:scale-105"
          >
            <span>Explore All Breeds & Puppies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. TRUST SECTION (The B.tech Puppybala Promise) */}
      <TrustSection />

      {/* 5. HOW IT WORKS */}
      <HowItWorks />

      {/* 6. FINAL CTA SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-8 sm:p-14 text-center border border-amber-900/50 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center border border-amber-400/30">
              <PawPrint className="w-7 h-7" />
            </div>

            {/* Requirement copy */}
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
              Interested in a Puppy?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Send us an enquiry and our team will contact you.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Send Enquiry Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I am interested in adopting a puppy. Please share details.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Us ({CONTACT_CONFIG.whatsappDisplay})</span>
              </a>

              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-xl border border-white/20 transition-colors"
              >
                <span>Contact Info</span>
              </Link>
            </div>

            <p className="text-xs text-amber-200/70 pt-2">
              Serving Bhopal, Indore, Sehore, Vidisha, Raisen, Mandideep, and nearby MP areas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
