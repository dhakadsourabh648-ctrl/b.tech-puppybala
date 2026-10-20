import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, Clock, MapPin, Mail, 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck 
} from 'lucide-react';
import EnquiryForm from '../components/EnquiryForm';
import { FAQS, SERVICE_AREAS } from '../data/trustData';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact Us | B.tech Puppybala Bhopal';
  }, []);

  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* 1. Header */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>We'd Love To Hear From You</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display">
          Contact & Enquiry
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Have questions about a puppy, diet, or adoption process? Fill out the inquiry form below or connect directly with our Bhopal team via WhatsApp.
        </p>
      </section>

      {/* 2. Main Grid: Inquiry Form on Left, Contact Information on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Frontend Inquiry UI Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-soft">
          <div className="mb-6">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md">
              Frontend Inquiry Form
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-display mt-2">
              Send a Puppy Enquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your favorite puppy or inquire generally. Our team will contact you back with complete details.
            </p>
          </div>

          <EnquiryForm />
        </div>

        {/* Right Column: Contact Channels & Location Information */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Contact Card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-5">
            <h3 className="font-extrabold text-slate-900 text-lg font-display flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Direct Assistance</span>
            </h3>

            {/* WhatsApp */}
            <a
              href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about a puppy.')}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerClickRipple(e, 'rgba(16, 185, 129, 0.25)')}
              className="btn-tactile p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-start gap-3.5 group block"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  WhatsApp Support (Recommended)
                </p>
                <p className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800">
                  WhatsApp: {CONTACT_CONFIG.whatsappDisplay}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant replies, puppy videos & consultation
                </p>
              </div>
            </a>

            {/* Phone */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Phone Callback
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Request a callback using the form and our specialist will dial you within 30 minutes.
                </p>
              </div>
            </div>

            {/* Operating Timings */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enquiry Timings
                </p>
                <p className="text-sm font-bold text-slate-900">
                  9:00 AM - 8:30 PM
                </p>
                <p className="text-xs text-slate-500">
                  Open 7 Days a week for family enquiries
                </p>
              </div>
            </div>

          </div>

          {/* Location & Safe Home Visitation Policy Card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-soft space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <MapPin className="w-5 h-5" />
              <h4 className="font-bold text-slate-900 text-base font-display">
                Location & Meeting Policy
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We operate as a private home-based puppy nursery based in <strong className="text-slate-900">Bhopal, Madhya Pradesh</strong>.
            </p>

            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed">
              <strong>Appointment Note:</strong> To ensure the tranquility, comfort, and safety of our infant puppies, home visits are scheduled by prior appointment following a live WhatsApp video consultation.
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-slate-700 mb-2">
                Serving Bhopal & Nearby MP Regions:
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-600">
                {SERVICE_AREAS.map((city, idx) => (
                  <span key={idx} className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Frequently Asked Questions (FAQ) Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-100 shadow-soft max-w-4xl mx-auto space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Answers to common questions about adopting a home-raised puppy from B.tech Puppybala.
          </p>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="pt-3 first:pt-0">
                <button
                  onClick={(e) => {
                    triggerClickRipple(e, 'rgba(217, 119, 6, 0.2)');
                    toggleFaq(index);
                  }}
                  className="btn-tactile w-full py-3 flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-amber-700 transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="pb-3 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
