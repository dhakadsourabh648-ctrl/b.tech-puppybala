import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Shield, Award, Users, MapPin, Sparkles, 
  ArrowRight, CheckCircle2, Home, Compass 
} from 'lucide-react';
import { TRUST_METRICS } from '../data/trustData';
import { triggerClickRipple } from '../utils/ripple';

export default function AboutPage({ onOpenEnquiry }) {
  useEffect(() => {
    document.title = 'About Us | B.tech Puppybala - Bhopal Home Nursery';
  }, []);

  const values = [
    {
      title: "100% Cage-Free Home Upbringing",
      desc: "Our puppies are nurtured indoors around loving family members, sound-socialized with everyday household life so they grow confident and calm.",
      icon: Home
    },
    {
      title: "Science & Compassion Driven",
      desc: "Founded by tech graduates from Bhopal who combined structured care routines, optimal puppy nutrition, and boundless love for dogs.",
      icon: Compass
    },
    {
      title: "Complete Family Transparency",
      desc: "We encourage live WhatsApp video calls and clear discussions on diet, temperament, and puppy care before any adoption decision.",
      icon: Shield
    },
    {
      title: "Lifetime Transition Advice",
      desc: "We don't just hand off a puppy; we offer continuous feeding, potty-training, and adjustment advice as your pup settles into your home.",
      icon: Users
    }
  ];

  return (
    <div className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
      {/* 1. Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Heart className="w-4 h-4 text-amber-600 fill-amber-600" />
          <span>Our Origin & Purpose</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-display tracking-tight">
          About <span className="text-gradient">B.tech Puppybala</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          The story behind Bhopal’s favorite home-based, ethical puppy haven dedicated to raising joyful companions for families across Madhya Pradesh.
        </p>
      </section>

      {/* 2. Story Section with Image Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-block text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            Founded in Bhopal, Madhya Pradesh
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 font-display leading-snug">
            From Engineering Degrees to Raising Happy Tails with Love
          </h2>

          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              The name <strong className="text-slate-900">B.tech Puppybala</strong> began with a simple, heartfelt realization. As engineering graduates and lifelong dog lovers in Bhopal, we witnessed how traditional commercial pet mills treated puppies — cramped in wire cages, separated too early from maternal care, and handed off with zero transparency.
            </p>
            <p>
              We believed puppies and families deserved vastly better. We envisioned a home-based initiative where every litter is raised right inside our household, weaned gently on balanced nutrition, and handled with affectionate human touch from day one.
            </p>
            <p>
              Today, with over <strong className="text-slate-900">60+ happy families</strong> connected in Bhopal, Indore, Sehore, Vidisha, and nearby MP cities, B.tech Puppybala stands as a symbol of trust, ethical home care, and honest guidance for pet parents.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/puppies"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105"
            >
              <span>Explore Our Puppies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              <span>Speak to Us</span>
            </button>
          </div>
        </div>

        {/* Visual Collage */}
        <div className="lg:col-span-6 relative">
          <div className="relative mx-auto max-w-md">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
                alt="Happy puppies playing in a caring home environment"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Official Logo Emblem Seal */}
            <div className="absolute -top-6 -right-4 sm:-right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-black ring-4 ring-amber-400/50 z-20 hover:scale-105 transition-transform" title="B.tech Puppybala Official Seal">
              <img
                src="/logo.png"
                alt="B.tech Puppybala Official Emblem"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlapping small card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-amber-100 max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🐾
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">100% Home Environment</p>
                  <p className="text-[11px] text-slate-500">Raised with family affection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-amber-100 shadow-soft space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
            Our Guiding Pillars
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display mt-2">
            Why We Are Different
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every puppy that grows under our roof is nurtured with four foundational promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-warm-50/70 border border-amber-100/60 hover:bg-white hover:shadow-card transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 font-display">
                    {v.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Service Area Coverage */}
      <section className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Regional Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Operating from Bhopal, Serving Madhya Pradesh
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-2 leading-relaxed">
            We offer direct personal pick-up within Bhopal and safe, personalized transit to nearby cities including Indore, Sehore, Vidisha, Raisen, Mandideep, and Hoshangabad. Every puppy travels safely with appropriate hydration and ventilation.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          {["Bhopal City", "Indore", "Sehore", "Vidisha", "Mandideep", "Raisen", "Hoshangabad", "Dewas"].map((city) => (
            <span key={city} className="px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 font-semibold backdrop-blur-xs">
              ✓ {city}
            </span>
          ))}
        </div>
      </section>

      {/* 5. CTA */}
      <section className="text-center max-w-xl mx-auto space-y-4">
        <h3 className="text-2xl font-extrabold text-slate-900 font-display">
          Ready to welcome your furry friend?
        </h3>
        <p className="text-sm text-slate-600">
          Reach out to our team today to check available puppies or ask any questions about breed compatibility.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/puppies"
            onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.5)')}
            className="btn-tactile shimmer-sweep glow-amber px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center justify-center"
          >
            Browse Available Puppies
          </Link>
          <Link
            to="/contact"
            onClick={(e) => triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)')}
            className="btn-tactile px-6 py-3 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-50 transition-all inline-flex items-center justify-center"
          >
            Contact Details & Enquiry
          </Link>
        </div>
      </section>
    </div>
  );
}
