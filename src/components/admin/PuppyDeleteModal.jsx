import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function PuppyDeleteModal({
  isOpen,
  puppy,
  onClose,
  onConfirm,
  isDeleting = false,
}) {
  if (!isOpen || !puppy) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white text-center">
          Delete "{puppy.name}"?
        </h3>
        <p className="text-xs text-slate-400 text-center mt-1.5 leading-relaxed">
          Kya aap sach me is puppy ko database aur website se delete karna chahte hain? Yeh action wapas nahi liya ja sakta.
        </p>

        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
            <img
              src={puppy.images?.[0] || puppy.heroImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
              alt={puppy.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">{puppy.name}</div>
            <div className="text-[11px] text-amber-400 font-medium">
              {puppy.breed} • ₹{puppy.price?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Puppy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
