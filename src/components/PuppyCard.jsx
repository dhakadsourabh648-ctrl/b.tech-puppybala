import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, MessageCircle, Video } from 'lucide-react';
import { isVideoMedia } from '../utils/mediaUtils';
import { triggerClickRipple } from '../utils/ripple';

// Clean fallback image for pet avatars
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

export default function PuppyCard({ puppy, onOpenEnquiry }) {
  const puppyId = puppy.id || puppy._id;
  const heroMedia =
    Array.isArray(puppy.images) && puppy.images.length > 0
      ? puppy.images[0]
      : puppy.heroImage || FALLBACK_IMAGE;

  const [imgSrc, setImgSrc] = useState(heroMedia);

  useEffect(() => {
    setImgSrc(heroMedia);
  }, [heroMedia]);

  const currentStatus = puppy.status || puppy.availability || 'Available';
  const isAvailable = currentStatus === 'Available';
  const isReserved = currentStatus === 'Reserved';
  const temperamentList = Array.isArray(puppy.temperament) && puppy.temperament.length > 0
    ? puppy.temperament
    : ['Home-Raised', 'Friendly'];

  const formattedPrice = Number(puppy.price || 0).toLocaleString('en-IN');

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-amber-100/90 shadow-soft hover:shadow-card card-hover flex flex-col justify-between transition-all duration-300">
      
      {/* Top Image / Video Section - Fixed solid height & Clickable */}
      <Link
        to={`/puppies/${puppyId}`}
        className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-900 shrink-0 block cursor-pointer"
      >
        {isVideoMedia(imgSrc) ? (
          <div className="relative w-full h-full bg-slate-950">
            <video
              src={imgSrc}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              muted
              loop
              playsInline
              autoPlay
            />
            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-700/60 flex items-center gap-1 backdrop-blur-sm shadow z-10">
              <Video className="w-3 h-3 text-purple-400" />
              <span>Video</span>
            </span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={`${puppy.name} - ${puppy.breed}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />
        )}

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Availability Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md backdrop-blur-md pointer-events-auto ${
              isAvailable
                ? 'bg-emerald-500 text-white'
                : isReserved
                ? 'bg-amber-500 text-white'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            ● {currentStatus}
          </span>

          {/* Gender Badge */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-md backdrop-blur-md">
            {puppy.gender === 'Male' ? '♂ Male' : '♀ Female'}
          </span>
        </div>
      </Link>

      {/* Card Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Breed & Price Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              {puppy.breed}
            </span>
            <div className="text-right">
              <span className="text-xs text-slate-400 block -mb-0.5">Adoption Price</span>
              <span className="text-lg font-black text-amber-700 font-display">
                ₹{formattedPrice}
              </span>
            </div>
          </div>

          {/* Puppy Name - Clickable */}
          <Link to={`/puppies/${puppyId}`} className="block">
            <h3 className="text-2xl font-extrabold text-slate-900 font-display tracking-tight group-hover:text-amber-700 transition-colors">
              {puppy.name}
            </h3>
          </Link>

          {/* Age & Origin Meta */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Age: {puppy.age}</span>
            </span>
            <span className="text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-md text-[11px] font-medium">
              Home-Raised in Bhopal
            </span>
          </div>

          {/* Temperament Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {temperamentList.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-0.5 rounded-lg border border-slate-200/70"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {puppy.description}
          </p>
        </div>

        {/* Action Buttons: View Details & Enquire Now */}
        <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100">
          <Link
            to={`/puppies/${puppyId}`}
            onClick={(e) => triggerClickRipple(e, 'rgba(100, 116, 139, 0.25)')}
            className="btn-tactile flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={(e) => {
              triggerClickRipple(e, 'rgba(255, 255, 255, 0.55)');
              if (onOpenEnquiry) onOpenEnquiry(puppy);
            }}
            className={`btn-tactile shimmer-sweep glow-amber flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer ${
              isAvailable
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-amber-500/20'
                : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'Enquire Now' : 'Enquire Similar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
