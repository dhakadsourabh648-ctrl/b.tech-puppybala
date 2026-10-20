import React, { useState } from 'react';
import {
  Gift,
  Utensils,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
} from 'lucide-react';

const ICON_MAP = {
  Utensils: Utensils,
  ShieldCheck: ShieldCheck,
  Sparkles: Sparkles,
  Gift: Gift,
  Tag: Tag,
};

export default function OffersBanner({ offerData, offers, onOpenEnquiry }) {
  // Normalize offers input: could be `offers` array or single `offerData`
  let list = [];
  if (Array.isArray(offers)) {
    list = offers;
  } else if (Array.isArray(offerData)) {
    list = offerData;
  } else if (offerData && typeof offerData === 'object' && Object.keys(offerData).length > 0) {
    list = [offerData];
  }

  // Filter only active offers if active field is present
  const activeOffers = list.filter((o) => o && (o.active === undefined || o.active === true));

  const [currentIndex, setCurrentIndex] = useState(0);

  // If no active offers, hide the offer section completely
  if (!activeOffers || activeOffers.length === 0) {
    return null;
  }

  const currentOffer = activeOffers[currentIndex] || activeOffers[0];
  const items = Array.isArray(currentOffer.items) ? currentOffer.items : [];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeOffers.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeOffers.length) % activeOffers.length);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-10 shadow-xl border border-amber-500/30 transition-all duration-500">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Multi-offer carousel navigation controls */}
      {activeOffers.length > 1 && (
        <div className="relative z-20 flex items-center justify-between mb-4 pb-2 border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
              Active Offers ({currentIndex + 1} of {activeOffers.length})
            </span>
            <div className="flex gap-1.5 ml-2">
              {activeOffers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx ? 'w-6 bg-amber-300' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to offer ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous offer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next offer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Top Header Badge & Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          {currentOffer.badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
              <Gift className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{currentOffer.badge}</span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-3">
            {currentOffer.title}
          </h2>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            {currentOffer.description || currentOffer.subtitle}
          </p>

          {currentOffer.highlightText && (
            <div className="mt-3 inline-block bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-1 rounded-full shadow-md">
              {currentOffer.highlightText}
            </div>
          )}
        </div>

        {/* Dynamic Offer Items Grid */}
        {items.length > 0 && (
          <div
            className={`grid gap-4 sm:gap-6 mb-8 ${
              items.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : items.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {items.map((item, index) => {
              const name = typeof item === 'string' ? item : item.name;
              const desc = typeof item === 'string' ? '' : item.description;
              const iconKey = typeof item === 'string' ? 'Gift' : item.icon;
              const IconComponent = ICON_MAP[iconKey] || Gift;

              return (
                <div
                  key={index}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 mb-4 shadow-xs">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                      <h3 className="font-bold text-white text-base">
                        {name}
                      </h3>
                    </div>
                    {desc && (
                      <p className="text-xs text-amber-100/80 leading-relaxed">
                        {desc}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-200">
                    <span>100% Free Included</span>
                    <span>Item #0{index + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-amber-500/40">
          <div className="space-y-1 text-center sm:text-left">
            {currentOffer.terms && (
              <p className="text-xs text-amber-200/90 max-w-xl">
                {currentOffer.terms}
              </p>
            )}
            {currentOffer.endDate && (
              <p className="text-[11px] text-amber-300/80 flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Valid until {new Date(currentOffer.endDate).toLocaleDateString('en-IN')}</span>
              </p>
            )}
          </div>

          <button
            onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm rounded-xl shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Claim Offer With Enquiry</span>
            <ArrowRight className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      </div>
    </section>
  );
}
