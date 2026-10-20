import React from 'react';
import { HeartHandshake, MapPin, Home, Sparkles, CheckCircle } from 'lucide-react';
import { TRUST_METRICS } from '../data/trustData';

const ICON_MAP = {
  HeartHandshake: HeartHandshake,
  MapPin: MapPin,
  Home: Home,
  Sparkles: Sparkles,
};

export default function TrustSection() {
  return (
    <section className="py-12 bg-white/70 border-y border-amber-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/80 px-3 py-1 rounded-full">
            Why Pet Parents Trust Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-2">
            The B.tech Puppybala Promise
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Committed to ethical, home-raised puppies with complete warmth and family care.
          </p>
        </div>

        {/* 4 Trust Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_METRICS.map((metric) => {
            const Icon = ICON_MAP[metric.icon] || CheckCircle;
            return (
              <div
                key={metric.id}
                className="bg-white rounded-2xl p-6 border border-amber-100/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 group-hover:bg-amber-100 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-4 transition-colors">
                  <Icon className="w-7 h-7" />
                </div>

                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-display mb-1">
                  {metric.value}
                </div>

                <h3 className="text-base font-bold text-amber-700 mb-2">
                  {metric.label}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
