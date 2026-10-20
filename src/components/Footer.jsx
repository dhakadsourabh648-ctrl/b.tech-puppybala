import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, MapPin, Phone, MessageCircle, Heart, Shield, Clock } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function Footer({ onOpenEnquiry }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-black shrink-0">
                <img
                  src="/logo.png"
                  alt="B.tech Puppybala Official Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white font-display">
                  B.tech <span className="text-amber-400">Puppybala</span>
                </span>
                <p className="text-xs text-amber-300 font-medium">Happy Pups • Happier Families</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              Home-raised, healthy puppies nurtured in loving family surroundings. We proudly serve pet parents across Bhopal and nearby MP cities with complete transparency and care.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>100% Home-Raised • Zero Cage Policy</span>
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Service Coverage</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Operating centrally from <strong className="text-slate-200">Bhopal, MP</strong> with local pickup and safe transit to:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-1.5">• Bhopal City</li>
              <li className="flex items-center gap-1.5">• Indore</li>
              <li className="flex items-center gap-1.5">• Sehore</li>
              <li className="flex items-center gap-1.5">• Vidisha</li>
              <li className="flex items-center gap-1.5">• Mandideep</li>
              <li className="flex items-center gap-1.5">• Raisen</li>
              <li className="flex items-center gap-1.5">• Hoshangabad</li>
              <li className="flex items-center gap-1.5">• Dewas</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/puppies" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Explore Available Puppies
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Our Story & Philosophy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-amber-400 transition-colors">
                  Contact & Enquiry Form
                </Link>
              </li>
              <li>
                <button
                  onClick={(e) => {
                    triggerClickRipple(e, 'rgba(245, 158, 11, 0.3)');
                    if (onOpenEnquiry) onOpenEnquiry(null);
                  }}
                  className="btn-tactile text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Send Puppy Enquiry</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details & Hours */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base mb-4">Get In Touch</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Daily Enquiry Timings</p>
                  <p className="text-xs text-slate-400">9:00 AM - 8:30 PM (All 7 Days)</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">WhatsApp Direct</p>
                  <a
                    href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala, I would like to enquire about available puppies.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    {CONTACT_CONFIG.whatsappDisplay} (Quick Reply)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Phone Callback</p>
                  <p className="text-xs text-slate-400">Request via Enquiry Form</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} B.tech Puppybala. All rights reserved. Operating ethically from Bhopal, MP.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link
              to="/admin"
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
              title="Protected Admin Access for Nursery Owner"
            >
              <span>Admin Portal</span>
              <span>🔒</span>
            </Link>
            <div className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>for puppy lovers across MP</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
