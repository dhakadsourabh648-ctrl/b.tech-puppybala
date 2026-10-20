import React, { useEffect } from 'react';
import { X, PawPrint } from 'lucide-react';
import EnquiryForm from './EnquiryForm';

export default function EnquiryModal({ isOpen, onClose, selectedPuppy }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-100 z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Quick Puppy Adoption Enquiry
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mb-1">
          {selectedPuppy ? `Enquire About ${selectedPuppy.name}` : 'Enquire About a Puppy'}
        </h3>

        <p className="text-xs text-slate-500 mb-6">
          Fill in your details below and our Bhopal team will reach out with full details, video call schedule, and answer all questions.
        </p>

        {/* Form */}
        <EnquiryForm initialPuppy={selectedPuppy} isCompact={true} />
      </div>
    </div>
  );
}
