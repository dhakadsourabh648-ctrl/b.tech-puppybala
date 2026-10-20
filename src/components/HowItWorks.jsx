import React from 'react';
import { Search, Send, PhoneCall, Truck } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/trustData';

const ICON_MAP = {
  Search: Search,
  Send: Send,
  PhoneCall: PhoneCall,
  Truck: Truck,
};

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-warm-50/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-3">
            How It Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Adopting your new best friend is smooth, transparent, and completely stress-free.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {HOW_IT_WORKS_STEPS.map((stepItem, index) => {
            const Icon = ICON_MAP[stepItem.icon] || Search;
            return (
              <div
                key={stepItem.step}
                className="relative bg-white rounded-3xl p-6 border border-amber-100 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col items-start"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between w-full mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-600/25">
                    {stepItem.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 font-display mb-2">
                  {stepItem.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {stepItem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
