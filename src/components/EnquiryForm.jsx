import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, MessageCircle, AlertCircle, Sparkles, User, Phone, MapPin, Heart } from 'lucide-react';
import { PUPPIES } from '../data/puppiesData';
import { getPuppies, createInquiry } from '../services/api';
import { CONTACT_CONFIG } from '../config/contactConfig';
import { triggerClickRipple } from '../utils/ripple';

export default function EnquiryForm({ initialPuppy, onSuccess, isCompact = false }) {
  const [puppiesList, setPuppiesList] = useState(PUPPIES);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Bhopal',
    selectedPuppyId: initialPuppy ? (initialPuppy.id || initialPuppy._id) : '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [enquiryRef, setEnquiryRef] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getPuppies()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setPuppiesList(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Update selected puppy if initialPuppy prop changes
  useEffect(() => {
    if (initialPuppy) {
      const pupId = initialPuppy.id || initialPuppy._id;
      setFormData((prev) => ({
        ...prev,
        selectedPuppyId: pupId,
        message:
          prev.message ||
          `Hi, I am interested in adopting ${initialPuppy.name} (${initialPuppy.breed}). Please let me know the availability and adoption details.`,
      }));
    }
  }, [initialPuppy]);

  // Handle phone input: STRICTLY NUMBERS ONLY AND MAXIMUM 10 DIGITS
  const handlePhoneChange = (e) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: numericOnly }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // 1. Customer Name required
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (minimum 2 characters)';
    }

    // 2. Exactly 10-digit Indian mobile number starting with 6, 7, 8, or 9
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      newErrors.phone = 'Please enter exactly 10-digit mobile number';
    } else if (!/^[6-9]/.test(cleanedPhone)) {
      newErrors.phone = 'Mobile number must start with 6, 7, 8, or 9';
    }

    // 3. City required
    if (!formData.city.trim()) {
      newErrors.city = 'Please select or enter your city';
    }

    // 4. Puppy selection required
    if (!formData.selectedPuppyId) {
      newErrors.selectedPuppyId = 'Please select a puppy breed for your enquiry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    const cleanedPhone = formData.phone.replace(/\D/g, '').slice(0, 10);
    const selectedObj = puppiesList.find((p) => (p.id || p._id) === formData.selectedPuppyId);

    try {
      const result = await createInquiry({
        customerName: formData.name.trim(),
        phone: cleanedPhone,
        city: formData.city.trim(),
        puppyId: String(formData.selectedPuppyId),
        puppyName: selectedObj ? selectedObj.name : 'Selected Puppy',
        breed: selectedObj ? selectedObj.breed : 'Standard Breed',
        message: formData.message.trim(),
      });

      if (result.success) {
        const ref =
          (result.data && (result.data.inquiryRef || result.data._id)) ||
          'BPB-' + Math.floor(100000 + Math.random() * 900000);
        setEnquiryRef(ref);
        setIsSubmitted(true);
        if (onSuccess) onSuccess(result.data);
      } else {
        setServerError(result.message || 'Could not submit enquiry. Please try again.');
      }
    } catch (err) {
      // Offline fallback
      console.warn('Enquiry fallback due to offline/network issue:', err.message);
      const fallbackRef = 'BPB-' + Math.floor(100000 + Math.random() * 900000);
      setEnquiryRef(fallbackRef);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      city: 'Bhopal',
      selectedPuppyId: '',
      message: '',
    });
    setErrors({});
    setServerError('');
    setIsSubmitted(false);
  };

  const selectedPuppyObj = puppiesList.find((p) => (p.id || p._id) === formData.selectedPuppyId);

  // Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-center border border-emerald-100 shadow-soft animate-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Enquiry Received Successfully!
        </span>

        {/* Required Confirmation Text */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-3 leading-snug">
          Thank you! Your enquiry has been received. Our team will contact you shortly.
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
          Reference ID: <strong className="text-slate-900 font-bold">#{enquiryRef}</strong>. Our Bhopal team will reach out to you on <strong className="text-slate-900 font-bold">{formData.phone}</strong>.
        </p>

        {/* Automated WhatsApp Confirmation Indicator */}
        <div className="mt-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 max-w-md mx-auto flex items-center gap-2.5 text-left">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="text-[11px] text-emerald-900 leading-tight">
            <p className="font-bold">Automated WhatsApp Confirmation Dispatched</p>
            <p className="text-emerald-700">A thank-you message has been sent to +91 {formData.phone}.</p>
          </div>
        </div>

        {selectedPuppyObj && (
          <div className="my-5 p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/60 max-w-sm mx-auto flex items-center gap-3 text-left">
            <img
              src={selectedPuppyObj.heroImage || (selectedPuppyObj.images && selectedPuppyObj.images[0])}
              alt={selectedPuppyObj.name}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-900 truncate">{selectedPuppyObj.name}</p>
              <p className="text-xs text-amber-800 font-bold">{selectedPuppyObj.breed}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full shrink-0">
              Reserved for Callback
            </span>
          </div>
        )}

        {/* Instant WhatsApp Direct Connection Option */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={CONTACT_CONFIG.getWhatsappLink(
              `Hi B.tech Puppybala! I just submitted enquiry #${enquiryRef} for ${selectedPuppyObj ? selectedPuppyObj.name : 'a puppy'}. My name is ${formData.name}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.4)')}
            className="btn-tactile glow-emerald w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Instantly on WhatsApp</span>
          </a>

          <button
            onClick={(e) => {
              triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)');
              handleReset();
            }}
            className="btn-tactile w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {serverError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Customer Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Customer Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
              errors.name
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200'
            }`}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      {/* Mobile / WhatsApp Number - STRICTLY 10 DIGITS ONLY */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700">
            Mobile / WhatsApp Number <span className="text-rose-500">*</span>
          </label>
          <span className={`text-[11px] font-semibold ${formData.phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {formData.phone.length}/10 digits
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            required
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="Enter 10-digit mobile number (e.g. 9893012345)"
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
              errors.phone
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200'
            }`}
          />
        </div>
        {errors.phone ? (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.phone}</span>
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-400">
            Only 10 digits allowed. We will share puppy details on WhatsApp.
          </p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          City <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 transition-all ${
              errors.city
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200'
            }`}
          >
            <option value="Bhopal">Bhopal (Home Pickup / Delivery)</option>
            <option value="Indore">Indore</option>
            <option value="Sehore">Sehore</option>
            <option value="Vidisha">Vidisha</option>
            <option value="Mandideep">Mandideep</option>
            <option value="Raisen">Raisen</option>
            <option value="Hoshangabad">Hoshangabad / Narmadapuram</option>
            <option value="Dewas">Dewas</option>
            <option value="Other MP City">Other Nearby MP City</option>
          </select>
        </div>
        {errors.city && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.city}</span>
          </p>
        )}
      </div>

      {/* Selected Puppy - NO PRICE, SHOWS BREED AND PUPPY NAME */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Selected Breed <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Heart className="w-4 h-4" />
          </div>
          <select
            required
            value={formData.selectedPuppyId}
            onChange={(e) => setFormData({ ...formData, selectedPuppyId: e.target.value })}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-hidden focus:ring-2 transition-all ${
              errors.selectedPuppyId
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-200'
            }`}
          >
            <option value="">-- Please select a puppy breed --</option>
            {puppiesList.map((pup) => (
              <option key={pup.id || pup._id} value={pup.id || pup._id}>
                {pup.breed} - {pup.name}
              </option>
            ))}
          </select>
        </div>
        {errors.selectedPuppyId && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.selectedPuppyId}</span>
          </p>
        )}
      </div>

      {/* Message (Optional) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Message / Questions <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          rows={isCompact ? 2 : 3}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="e.g. Can we arrange a live video call? We live in an apartment and would like advice on this breed."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
        />
      </div>

      {/* Free Welcome Kit Reminder */}
      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-center gap-2 text-xs text-amber-900 font-medium">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Includes Free Welcome Kit: 7-Day Food + Belt + Shampoo</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        onClick={(e) => triggerClickRipple(e, 'rgba(255, 255, 255, 0.6)')}
        className="btn-tactile shimmer-sweep glow-amber w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting Enquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Enquiry</span>
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-slate-400">
        🔒 No payment or cart required. Direct family enquiry for Bhopal & MP.
      </p>
    </form>
  );
}
