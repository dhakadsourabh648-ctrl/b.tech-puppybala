import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Dog,
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/phoneUtils';
import {
  adminGetInquiries,
  adminUpdateInquiryStatus,
  adminDeleteInquiry,
  adminResendInquiryWhatsApp,
  adminGetWhatsAppStatus,
} from '../../services/adminApi';

const STATUS_OPTIONS = ['New', 'Contacted', 'Follow-up', 'Closed'];

export default function AdminEnquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [whatsappFilter, setWhatsappFilter] = useState('All');

  // WhatsApp Diagnostics
  const [whatsappDiag, setWhatsappDiag] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchInquiriesList = async () => {
    try {
      setLoading(true);
      const [data, diag] = await Promise.allSettled([
        adminGetInquiries(),
        adminGetWhatsAppStatus(),
      ]);

      if (data.status === 'fulfilled') {
        setInquiries(data.value || []);
      }
      if (diag.status === 'fulfilled') {
        setWhatsappDiag(diag.value);
      }
    } catch (err) {
      console.warn('Error loading enquiries:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Customer Enquiries | B.tech Puppybala Admin';
    fetchInquiriesList();
  }, []);

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus =
      statusFilter === 'All' || inq.status === statusFilter;

    const matchesWhatsApp =
      whatsappFilter === 'All' || (inq.whatsappStatus || 'Pending') === whatsappFilter;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      inq.customerName?.toLowerCase().includes(term) ||
      inq.phone?.includes(term) ||
      inq.city?.toLowerCase().includes(term) ||
      inq.puppyName?.toLowerCase().includes(term) ||
      inq.breed?.toLowerCase().includes(term) ||
      inq.message?.toLowerCase().includes(term);

    return matchesStatus && matchesWhatsApp && matchesSearch;
  });

  // Calculate status counts
  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'New').length,
    contacted: inquiries.filter((i) => i.status === 'Contacted').length,
    followUp: inquiries.filter((i) => i.status === 'Follow-up').length,
    closed: inquiries.filter((i) => i.status === 'Closed').length,
    whatsappSent: inquiries.filter((i) => i.whatsappStatus === 'Sent').length,
    whatsappFailed: inquiries.filter((i) => i.whatsappStatus === 'Failed').length,
  };

  // Change Status Handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminUpdateInquiryStatus(id, newStatus);
      showToast(`Enquiry status updated to "${newStatus}"`);
      // Update local state
      setInquiries((prev) =>
        prev.map((inq) =>
          (inq._id || inq.id) === id ? { ...inq, status: newStatus } : inq
        )
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Resend WhatsApp Handler
  const handleResendWhatsApp = async (id, customerName) => {
    try {
      setResendingId(id);
      const updated = await adminResendInquiryWhatsApp(id);
      showToast(`WhatsApp confirmation re-triggered for ${customerName || 'customer'}! (${updated.whatsappStatus})`);
      setInquiries((prev) =>
        prev.map((inq) => ((inq._id || inq.id) === id ? updated : inq))
      );
    } catch (err) {
      alert('Failed to send WhatsApp message: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    const id = inquiryToDelete._id || inquiryToDelete.id;

    try {
      await adminDeleteInquiry(id);
      showToast(`Enquiry for "${inquiryToDelete.customerName}" deleted`);
      setInquiries((prev) =>
        prev.filter((inq) => (inq._id || inq.id) !== id)
      );
      setDeleteModalOpen(false);
      setInquiryToDelete(null);
    } catch (err) {
      alert('Failed to delete enquiry: ' + err.message);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Follow-up':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📩</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Customer Enquiries
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            View customer adoption leads, track automated WhatsApp thank-you delivery, and update enquiry progress.
          </p>
        </div>

        <button
          onClick={fetchInquiriesList}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* WhatsApp Platform Architecture Diagnostics Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">WhatsApp Business Platform</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {whatsappDiag?.isLive ? 'Meta Cloud API Live' : 'Dev Mock Mode Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Auto thank-you messages are triggered immediately upon customer submission.
              {!whatsappDiag?.isLive && ' Safe local simulation active (no external credentials required).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 self-end sm:self-auto">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {counts.whatsappSent} Delivered
          </span>
          {counts.whatsappFailed > 0 && (
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {counts.whatsappFailed} Failed
            </span>
          )}
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Status Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>All Leads</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('New')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'New'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-slate-950 text-blue-400 hover:text-blue-300 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>New</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {counts.new}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Contacted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'Contacted'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-amber-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Contacted</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {counts.contacted}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Follow-up')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'Follow-up'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-950 text-purple-400 hover:text-purple-300 border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Follow-up</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {counts.followUp}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('Closed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'Closed'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Closed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
              {counts.closed}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, 10-digit phone, city, or puppy..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
          Loading enquiries...
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80 p-8">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Enquiries Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'All'
              ? 'No customer enquiries match your search query or status filter.'
              : 'Customer adoption submissions will automatically appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInquiries.map((inq) => {
            const id = inq._id || inq.id;
            const whatsappUrl = buildWhatsAppUrl(
              inq.phone,
              `Hello ${inq.customerName || 'there'}, thank you for enquiring with B.tech Puppybala in Bhopal about ${
                inq.puppyName || 'our puppy'
              }. How can we assist you today?`
            );

            return (
              <div
                key={id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 shadow-sm transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Left Info: Customer, City, Puppy, Message, WhatsApp Delivery Info */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 flex-shrink-0">
                      {inq.customerName ? inq.customerName[0].toUpperCase() : 'C'}
                    </div>

                    <span className="text-base font-black text-white">
                      {inq.customerName}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {inq.city}
                    </span>

                    {inq.inquiryRef && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                        {inq.inquiryRef}
                      </span>
                    )}
                  </div>

                  {/* Selected Puppy & Breed */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Interested Puppy:</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Dog className="w-3.5 h-3.5" />
                      {inq.puppyName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{inq.breed}</span>
                  </div>

                  {/* Customer Message */}
                  {inq.message ? (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                      "{inq.message}"
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      No additional message provided.
                    </p>
                  )}

                  {/* Date & Time + Automated WhatsApp Delivery Status */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(inq.createdAt)}
                    </span>

                    <span className="text-slate-700">•</span>

                    {/* WhatsApp Status Badge */}
                    {inq.whatsappStatus === 'Sent' ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold"
                        title={`Message ID: ${inq.whatsappMessageId || 'N/A'}${inq.whatsappSentAt ? ' at ' + formatDateTime(inq.whatsappSentAt) : ''}`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp: Sent</span>
                        {inq.whatsappMessageId && (
                          <span className="text-[9px] font-mono text-emerald-500/70 ml-1">
                            ({inq.whatsappMessageId.startsWith('mock_') ? 'Mock' : inq.whatsappMessageId.slice(0, 10)})
                          </span>
                        )}
                      </span>
                    ) : inq.whatsappStatus === 'Failed' ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold"
                        title={inq.whatsappError || 'Message failed to deliver'}
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>WhatsApp: Failed</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold"
                        title="Pending dispatch"
                      >
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>WhatsApp: Pending</span>
                      </span>
                    )}

                    {/* Resend button */}
                    <button
                      onClick={() => handleResendWhatsApp(id, inq.customerName)}
                      disabled={resendingId === id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                      title="Re-send automated WhatsApp thank-you confirmation"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${resendingId === id ? 'animate-spin' : ''}`} />
                      <span>{resendingId === id ? 'Sending...' : 'Resend'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Actions: Phone, Manual WhatsApp Chat, Status Selector, Delete */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[11px] text-slate-400 hidden sm:inline md:hidden">
                      Status:
                    </span>
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(id, e.target.value)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-xl border bg-slate-950 focus:outline-none transition-colors cursor-pointer w-full sm:w-auto ${getStatusBadgeStyle(
                        inq.status
                      )}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-slate-900 text-slate-200"
                        >
                          ● {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Contact Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Call Button */}
                    <a
                      href={`tel:${inq.phone}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{inq.phone}</span>
                    </a>

                    {/* Manual WhatsApp Chat Button */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                      title="Open WhatsApp Chat in Web / App"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>

                    {/* Delete Enquiry */}
                    <button
                      onClick={() => {
                        setInquiryToDelete(inq);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete this enquiry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && inquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Delete Enquiry?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete the enquiry from{' '}
                <span className="font-bold text-white">
                  {inquiryToDelete.customerName}
                </span>{' '}
                ({inquiryToDelete.phone}) for{' '}
                <span className="font-bold text-amber-400">
                  {inquiryToDelete.puppyName}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setInquiryToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
