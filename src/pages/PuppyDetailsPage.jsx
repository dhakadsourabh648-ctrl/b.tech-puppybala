import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, ShieldCheck, MapPin, 
  MessageCircle, Sparkles, CheckCircle2, ChevronRight, Share2, Video, Play
} from 'lucide-react';
import { getPuppyById, PUPPIES } from '../data/puppiesData';
import { getPuppy, getOffers, getPuppies } from '../services/api';
import PuppyCard from '../components/PuppyCard';
import { isVideoMedia } from '../utils/mediaUtils';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function PuppyDetailsPage({ onOpenEnquiry }) {
  const { id } = useParams();

  // Try initial sync load from local cache, otherwise start with null
  const [puppy, setPuppy] = useState(() => getPuppyById(id) || null);
  const [activeOffers, setActiveOffers] = useState([]);
  const [allPuppies, setAllPuppies] = useState(PUPPIES);
  const [loading, setLoading] = useState(true);

  // Selected media index in gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadPuppyData() {
      setLoading(true);
      try {
        const [fetchedPuppy, fetchedOffers, list] = await Promise.all([
          getPuppy(id),
          getOffers(),
          getPuppies(),
        ]);

        if (isMounted) {
          if (fetchedPuppy) {
            setPuppy(fetchedPuppy);

            // Extract all media files (photos & videos)
            const imgs = Array.isArray(fetchedPuppy.images) && fetchedPuppy.images.length > 0
              ? fetchedPuppy.images
              : Array.isArray(fetchedPuppy.gallery) && fetchedPuppy.gallery.length > 0
              ? fetchedPuppy.gallery
              : fetchedPuppy.heroImage
              ? [fetchedPuppy.heroImage]
              : [];

            // If a video exists in this puppy's media, auto-select it so video plays immediately!
            const videoIdx = imgs.findIndex((m) => isVideoMedia(m));
            if (videoIdx !== -1) {
              setActiveImageIndex(videoIdx);
            } else {
              setActiveImageIndex(0);
            }
          }

          if (Array.isArray(fetchedOffers)) {
            setActiveOffers(fetchedOffers);
          } else if (fetchedOffers && typeof fetchedOffers === 'object') {
            setActiveOffers([fetchedOffers]);
          } else {
            setActiveOffers([]);
          }

          if (list && list.length > 0) {
            setAllPuppies(list);
          }
        }
      } catch (err) {
        console.warn('Could not load live puppy details:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPuppyData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (puppy && puppy.name) {
      document.title = `${puppy.name} (${puppy.breed}) | B.tech Puppybala Bhopal`;
    }
  }, [puppy]);

  // Loading Screen
  if (loading && !puppy) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4">
        <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
        <h3 className="text-base font-bold text-slate-800">Puppy details load ho rahi hain...</h3>
        <p className="text-xs text-slate-500 mt-1">Video aur photos fetch kiye ja rahe hain.</p>
      </div>
    );
  }

  // Not Found Screen
  if (!puppy) {
    return (
      <div className="py-20 max-w-lg mx-auto text-center px-4">
        <h2 className="text-2xl font-bold text-slate-800 font-display">Puppy Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The puppy profile you are looking for may have been updated or adopted.
        </p>
        <Link
          to="/puppies"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Puppies</span>
        </Link>
      </div>
    );
  }

  // Resolve media array safely
  const galleryImages =
    Array.isArray(puppy.images) && puppy.images.length > 0
      ? puppy.images
      : Array.isArray(puppy.gallery) && puppy.gallery.length > 0
      ? puppy.gallery
      : puppy.heroImage
      ? [puppy.heroImage]
      : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80'];

  const currentMedia = galleryImages[activeImageIndex] || galleryImages[0];
  const isCurrentVideo = isVideoMedia(currentMedia);

  const isAvailable = (puppy.status || puppy.availability) === 'Available';
  const primaryOffer = activeOffers.length > 0 ? activeOffers[0] : null;

  const puppyIdentifier = puppy.id || puppy._id || 'PB';
  const formattedPrice = Number(puppy.price || 0).toLocaleString('en-IN');

  const temperamentList = Array.isArray(puppy.temperament) && puppy.temperament.length > 0
    ? puppy.temperament
    : ['Friendly', 'Playful', 'Home-Raised'];

  const highlights = Array.isArray(puppy.homeRaisedHighlights) && puppy.homeRaisedHighlights.length > 0
    ? puppy.homeRaisedHighlights
    : [
        'Raised freely indoors with daily human affection and socialization',
        'Weaned on balanced puppy starter meals with healthy digestion',
        'Gentle temperament, perfectly suited for loving families',
      ];

  const locationText = puppy.locationBadge || 'Bhopal (Ready for local pickup or safe transit across MP)';

  // Related puppies
  const relatedPuppies = allPuppies
    .filter(
      (p) =>
        String(p.id || p._id) !== String(puppyIdentifier) &&
        ((p.status || p.availability) === 'Available')
    )
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${puppy.name} (${puppy.breed}) - B.tech Puppybala`,
          text: `Check out this cute ${puppy.breed} puppy on B.tech Puppybala Bhopal!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-amber-700">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/puppies" className="hover:text-amber-700">
          Puppies
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">
          {puppy.name} ({puppy.breed})
        </span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-start">
        {/* Left Column: Video & Photo Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Display Image or Video */}
          <div className="relative min-h-[300px] sm:min-h-[440px] aspect-4/3 rounded-3xl overflow-hidden bg-slate-950 border border-amber-200/60 shadow-xl flex items-center justify-center">
            {isCurrentVideo ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  key={currentMedia}
                  src={currentMedia}
                  controls
                  autoPlay
                  playsInline
                  loop
                  className="w-full h-full object-contain max-h-[500px] bg-black"
                />
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>Puppy Video Playing</span>
                  </span>
                </div>
              </div>
            ) : (
              <img
                src={currentMedia}
                alt={`${puppy.name} - ${puppy.breed}`}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80';
                }}
              />
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              {/* Only show badge if not video banner (video has its own banner) */}
              {!isCurrentVideo && (
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md pointer-events-auto ${
                    isAvailable
                      ? 'bg-emerald-500/95 text-white'
                      : 'bg-amber-500/95 text-white'
                  }`}
                >
                  ● {puppy.status || puppy.availability || 'Available'}
                </span>
              )}

              <div className="ml-auto pointer-events-auto">
                <button
                  onClick={(e) => {
                    triggerClickRipple(e, 'rgba(217, 119, 6, 0.3)');
                    handleShare();
                  }}
                  className="btn-tactile p-2.5 rounded-full bg-white/95 text-slate-700 hover:text-amber-600 shadow-md backdrop-blur-md transition-colors cursor-pointer"
                  title="Share this puppy"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnails (Photos & Videos) */}
          {galleryImages.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Gallery Photos & Videos ({galleryImages.length}):
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => {
                  const isThumbVideo = isVideoMedia(img);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-950 ${
                        activeImageIndex === idx
                          ? 'border-amber-600 shadow-md scale-105 ring-2 ring-amber-400'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={isThumbVideo ? 'Watch Puppy Video' : 'View Photo'}
                    >
                      {isThumbVideo ? (
                        <div className="w-full h-full relative bg-slate-900">
                          <video
                            src={img}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white shadow" />
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-purple-950/95 text-[9px] font-bold text-purple-300 border border-purple-800 flex items-center gap-1 shadow">
                            <Video className="w-2.5 h-2.5" />
                            <span>Video</span>
                          </span>
                        </div>
                      ) : (
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80';
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Home-Raised Quality Checklist */}
          <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200/60 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                Home-Raised Assurance
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Key Details, Price, Active Offer & CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Title & Breed */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                {puppy.breed}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ID: {String(puppyIdentifier).toUpperCase()}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
              {puppy.name}
            </h1>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 border border-amber-200/80 flex items-baseline justify-between shadow-xs">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Adoption Price</span>
              <span className="text-3xl sm:text-4xl font-black text-amber-800 font-display">
                ₹{formattedPrice}
              </span>
            </div>
            {primaryOffer && (
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300/60">
                🎁 {primaryOffer.title} Included
              </span>
            )}
          </div>

          {/* Quick Specification Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 block mb-0.5 font-medium">Breed</span>
              <span className="font-bold text-slate-800 text-sm">{puppy.breed}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 block mb-0.5 font-medium">Age</span>
              <span className="font-bold text-slate-800 text-sm">{puppy.age}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 block mb-0.5 font-medium">Gender</span>
              <span className="font-bold text-slate-800 text-sm">
                {puppy.gender === 'Male' ? '♂ Male' : '♀ Female'}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-slate-400 block mb-0.5 font-medium">Availability</span>
              <span
                className={`font-black text-sm ${
                  isAvailable ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                ● {puppy.status || puppy.availability || 'Available'}
              </span>
            </div>
          </div>

          {/* Temperament Tags */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Temperament & Personality
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {temperamentList.map((trait, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold bg-white text-slate-700 px-3 py-1 rounded-xl border border-amber-200/60 shadow-2xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              About {puppy.name}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {puppy.description}
            </p>
          </div>

          {/* Dynamic Active Offer Banner for this puppy */}
          {primaryOffer && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-md border border-amber-600/30 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  {primaryOffer.badge || 'Free Welcome Kit Offer'}
                </h4>
              </div>
              <p className="font-extrabold text-sm text-white">{primaryOffer.title}</p>
              {primaryOffer.description && (
                <p className="text-xs text-amber-100/90">{primaryOffer.description}</p>
              )}
              {Array.isArray(primaryOffer.items) && primaryOffer.items.length > 0 && (
                <ul className="text-xs text-amber-100/90 space-y-1 pt-1">
                  {primaryOffer.items.map((item, idx) => {
                    const itemName =
                      typeof item === 'object' && item !== null
                        ? item.name || item.title || JSON.stringify(item)
                        : String(item);
                    return (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-amber-300 font-bold">✓</span> {itemName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Required "Enquire About This Puppy" button */}
            <button
              onClick={(e) => {
                triggerClickRipple(e, 'rgba(255, 255, 255, 0.6)');
                if (onOpenEnquiry) onOpenEnquiry(puppy);
              }}
              className="btn-tactile shimmer-sweep glow-amber w-full py-4 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>Enquire About {puppy.name}</span>
            </button>

            {/* Direct WhatsApp Action */}
            <a
              href={CONTACT_CONFIG.getWhatsappLink(CONTACT_CONFIG.getPuppyEnquiryMessage(puppy.name))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.4)')}
              className="btn-tactile glow-emerald w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>

          {/* Delivery & Service Info */}
          <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{locationText}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Safe climate-controlled delivery available to Bhopal, Indore, Sehore, Vidisha, Raisen, Mandideep, and Hoshangabad.
            </p>
          </div>
        </div>
      </div>

      {/* Related / Other Available Puppies Section */}
      {relatedPuppies.length > 0 && (
        <section className="pt-12 border-t border-amber-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
                More Loving Companions
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 font-display mt-2">
                Other Available Puppies
              </h3>
            </div>
            <Link
              to="/puppies"
              className="text-xs font-bold text-amber-700 hover:text-amber-900"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPuppies.map((relatedPup) => (
              <PuppyCard
                key={relatedPup.id || relatedPup._id}
                puppy={relatedPup}
                onOpenEnquiry={onOpenEnquiry}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
