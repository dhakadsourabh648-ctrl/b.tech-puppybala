import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Eye,
  AlertTriangle,
  Clock,
  Utensils,
  ShieldCheck,
  Tag,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import {
  adminGetOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminToggleOfferStatus,
  adminDeleteOffer,
} from '../../services/adminApi';

const ICON_OPTIONS = ['Gift', 'Utensils', 'ShieldCheck', 'Sparkles', 'Tag'];

const BLANK_OFFER = {
  title: '',
  description: '',
  badge: 'Limited Period Special',
  highlightText: '',
  terms: 'Included automatically with every puppy adoption enquiry finalized this month.',
  active: true,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  items: [
    { name: '7 Days Dog Food', description: 'Starter nutritious puppy diet pack', icon: 'Utensils' },
    { name: 'Dog Belt', description: 'Soft adjustable puppy neck collar & leash', icon: 'ShieldCheck' },
    { name: 'Dog Shampoo', description: 'Gentle tear-free coat care shampoo', icon: 'Sparkles' },
  ],
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(BLANK_OFFER);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchOffersList = async () => {
    try {
      setLoading(true);
      const data = await adminGetOffers();
      setOffers(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.warn('Could not load offers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Manage Offers | B.tech Puppybala Admin';
    fetchOffersList();
  }, []);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...BLANK_OFFER,
      startDate: new Date().toISOString().split('T')[0],
    });
    setFormError('');
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (offer) => {
    setIsEditing(true);
    setEditingId(offer._id || offer.id);

    // Normalize items
    const normalizedItems = Array.isArray(offer.items)
      ? offer.items.map((it) => {
          if (typeof it === 'string') return { name: it, description: '', icon: 'Gift' };
          return {
            name: it.name || '',
            description: it.description || '',
            icon: it.icon || 'Gift',
          };
        })
      : [];

    setFormData({
      title: offer.title || '',
      description: offer.description || offer.subtitle || '',
      badge: offer.badge || 'Limited Period Special',
      highlightText: offer.highlightText || '',
      terms: offer.terms || '',
      active: offer.active !== undefined ? offer.active : true,
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
      items: normalizedItems.length > 0 ? normalizedItems : BLANK_OFFER.items,
    });
    setFormError('');
    setModalOpen(true);
  };

  // Add Item to Form
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', icon: 'Gift' }],
    }));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  // Remove item
  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter an offer title.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please enter an offer description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subtitle: formData.description.trim(),
        badge: formData.badge.trim() || 'Special Offer',
        highlightText: formData.highlightText.trim(),
        terms: formData.terms.trim(),
        active: Boolean(formData.active),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        items: formData.items.filter((it) => it.name && it.name.trim()),
      };

      if (isEditing) {
        await adminUpdateOffer(editingId, payload);
        showToast(`Offer "${payload.title}" updated successfully!`);
      } else {
        await adminCreateOffer(payload);
        showToast(`Offer "${payload.title}" created successfully!`);
      }

      setModalOpen(false);
      fetchOffersList();
    } catch (err) {
      setFormError(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active / Inactive Status
  const handleToggleStatus = async (offer) => {
    const id = offer._id || offer.id;
    const nextStatus = !offer.active;

    try {
      await adminToggleOfferStatus(id, nextStatus);
      showToast(`Offer "${offer.title}" ${nextStatus ? 'Activated' : 'Deactivated'}!`);
      setOffers((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, active: nextStatus } : o))
      );
    } catch (err) {
      alert('Failed to change status: ' + err.message);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    const id = offerToDelete._id || offerToDelete.id;

    try {
      await adminDeleteOffer(id);
      showToast(`Offer "${offerToDelete.title}" deleted.`);
      setOffers((prev) => prev.filter((o) => (o._id || o.id) !== id));
      setDeleteModalOpen(false);
      setOfferToDelete(null);
    } catch (err) {
      alert('Failed to delete offer: ' + err.message);
    }
  };

  const activeCount = offers.filter((o) => o.active).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎁</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Offers & Promotions Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, activate, deactivate, or delete promotional offers. Active offers appear automatically on the customer website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOffersList}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all"
            title="Reload offers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Overview Status Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-400">Offers Status:</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
            ● {activeCount} Active on Website
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-bold">
            {offers.length - activeCount} Inactive / Draft
          </span>
        </div>

        <div className="text-[11px] text-slate-500">
          {activeCount > 0 ? (
            <span className="text-emerald-400">
              ✓ Customers currently see active offer(s) on Home & Puppy Details.
            </span>
          ) : (
            <span className="text-amber-400 font-medium">
              ⚠ No active offers. Offer section is completely hidden from public website.
            </span>
          )}
        </div>
      </div>

      {/* Offers Cards List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
          Loading offers...
        </div>
      ) : offers.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80 p-8">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Offers Created Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create promotional offers like "FREE Welcome Kit" to attract puppy adoption enquiries.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Offer</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const id = offer._id || offer.id;
            const items = Array.isArray(offer.items) ? offer.items : [];

            return (
              <div
                key={id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  offer.active
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left: Offer Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          offer.active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {offer.active ? '● Active Live' : '○ Inactive Draft'}
                      </span>

                      {offer.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                          {offer.badge}
                        </span>
                      )}

                      {offer.highlightText && (
                        <span className="text-[11px] font-bold text-amber-400">
                          🎉 {offer.highlightText}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                        {offer.description || offer.subtitle}
                      </p>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Included Offer Items:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {items.map((it, idx) => {
                            const name = typeof it === 'string' ? it : it.name;
                            return (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                              >
                                <span className="text-amber-400">✓</span>
                                <span>{name}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Dates & Validity */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          From: {offer.startDate ? new Date(offer.startDate).toLocaleDateString('en-IN') : 'Ongoing'}
                        </span>
                      </span>
                      {offer.endDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            Until: {new Date(offer.endDate).toLocaleDateString('en-IN')}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => handleToggleStatus(offer)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        offer.active
                          ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700'
                      }`}
                    >
                      {offer.active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Active (Click to Deactivate)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive (Click to Activate)</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(offer)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setOfferToDelete(offer);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT OFFER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {isEditing ? `Edit Offer: ${formData.title}` : 'Create New Promotional Offer'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Configure promotion title, items, validity dates, and active status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. FREE Welcome Kit"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="e.g. Limited Period Festive Special"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what customers receive with this offer..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Highlight Tag & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Highlight Value Tag
                  </label>
                  <input
                    type="text"
                    value={formData.highlightText}
                    onChange={(e) =>
                      setFormData({ ...formData, highlightText: e.target.value })
                    }
                    placeholder="e.g. Worth ₹2,500 complimentary"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Offer Status
                  </label>
                  <label className="flex items-center gap-2.5 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-emerald-400">
                      Activate Offer on Website Immediately
                    </span>
                  </label>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date (Optional, leave blank for ongoing)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Included Offer Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Included Items ({formData.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5"
                    >
                      <span className="text-xs font-bold text-slate-500 w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(idx, 'name', e.target.value)
                        }
                        placeholder="Item Name (e.g. 7 Days Dog Food, Dog Belt, Shampoo)"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(idx, 'description', e.target.value)
                        }
                        placeholder="Brief item description (optional)"
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500 hidden sm:block"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Terms & Conditions Fine Print
                </label>
                <input
                  type="text"
                  value={formData.terms}
                  onChange={(e) =>
                    setFormData({ ...formData, terms: e.target.value })
                  }
                  placeholder="Included automatically with every puppy adoption enquiry finalized this month."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Offer'
                    : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteModalOpen && offerToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white text-center">
              Delete Offer "{offerToDelete.title}"?
            </h3>
            <p className="text-xs text-slate-400 text-center mt-1.5">
              This offer will be permanently deleted and immediately removed from the customer website.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOfferToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all"
              >
                Yes, Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
