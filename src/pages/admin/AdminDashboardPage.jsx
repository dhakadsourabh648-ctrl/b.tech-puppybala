import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dog,
  CheckCircle2,
  Tag,
  Inbox,
  Sparkles,
  ArrowRight,
  Phone,
  MessageCircle,
  PlusCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  MapPin,
  Edit2,
  Trash2,
  Video,
  Image as ImageIcon,
  Search,
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/phoneUtils';
import {
  getAdminDashboardStats,
  adminUpdateInquiryStatus,
  adminGetPuppies,
  adminCreatePuppy,
  adminUpdatePuppy,
  adminDeletePuppy,
  adminUpdatePuppyAvailability,
} from '../../services/adminApi';
import PuppyModal, { COMMON_BREEDS } from '../../components/admin/PuppyModal';
import PuppyDeleteModal from '../../components/admin/PuppyDeleteModal';
import { isVideoMedia } from '../../utils/mediaUtils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPuppies: 0,
    availablePuppies: 0,
    soldPuppies: 0,
    newEnquiries: 0,
    totalEnquiries: 0,
    contactedEnquiries: 0,
    followUpEnquiries: 0,
    closedEnquiries: 0,
    recentEnquiries: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Puppies State for Direct Management on Dashboard
  const [puppies, setPuppies] = useState([]);
  const [puppiesLoading, setPuppiesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State for Add / Edit Puppy
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState(null);

  // Modal State for Delete Puppy
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [puppyToDelete, setPuppyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getAdminDashboardStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Dashboard stats error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPuppiesList = async () => {
    try {
      setPuppiesLoading(true);
      const data = await adminGetPuppies();
      setPuppies(data || []);
    } catch (err) {
      console.warn('Dashboard puppies error:', err.message);
    } finally {
      setPuppiesLoading(false);
    }
  };

  const loadAllData = () => {
    fetchStats();
    fetchPuppiesList();
  };

  useEffect(() => {
    document.title = 'Admin Dashboard | B.tech Puppybala';
    loadAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchPuppiesList();
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3500);
  };

  // Inquiry Status Change
  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await adminUpdateInquiryStatus(inquiryId, newStatus);
      showToast(`Updated enquiry status to "${newStatus}"`);
      fetchStats();
    } catch (err) {
      alert('Failed to update enquiry status: ' + err.message);
    }
  };

  // Open Modal to Add Puppy
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedPuppy(null);
    setModalOpen(true);
  };

  // Open Modal to Edit Puppy
  const handleOpenEditModal = (pup) => {
    setIsEditing(true);
    setSelectedPuppy(pup);
    setModalOpen(true);
  };

  // Handle Add/Edit Submit from PuppyModal
  const handlePuppySubmit = async (payload) => {
    if (isEditing && selectedPuppy) {
      const id = selectedPuppy._id || selectedPuppy.id;
      await adminUpdatePuppy(id, payload);
      showToast(`Puppy "${payload.name}" updated successfully!`);
    } else {
      await adminCreatePuppy(payload);
      showToast(`Puppy "${payload.name}" added successfully!`);
    }
    fetchPuppiesList();
    fetchStats();
  };

  // Quick Toggle Availability
  const handleToggleAvailability = async (pup) => {
    const id = pup._id || pup.id;
    const current = pup.availability || pup.status;
    const nextStatus = current === 'Available' ? 'Sold' : 'Available';

    try {
      await adminUpdatePuppyAvailability(id, nextStatus);
      showToast(`Marked "${pup.name}" as ${nextStatus}!`);
      // Update local state
      setPuppies((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === id) {
            return { ...p, availability: nextStatus, status: nextStatus };
          }
          return p;
        })
      );
      fetchStats();
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (pup) => {
    setPuppyToDelete(pup);
    setDeleteModalOpen(true);
  };

  // Confirm Delete Puppy
  const handleConfirmDelete = async () => {
    if (!puppyToDelete) return;
    const id = puppyToDelete._id || puppyToDelete.id;

    try {
      setDeleting(true);
      await adminDeletePuppy(id);
      showToast(`Puppy "${puppyToDelete.name}" deleted successfully.`);
      setPuppies((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setDeleteModalOpen(false);
      setPuppyToDelete(null);
      fetchStats();
    } catch (err) {
      alert('Failed to delete puppy: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Follow-up':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Closed':
        return 'bg-slate-700/30 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  // Dynamically include any custom breeds added to puppies
  const allBreedsList = React.useMemo(() => {
    const customBreeds = puppies.map((p) => p.breed?.trim()).filter(Boolean);
    return Array.from(new Set([...COMMON_BREEDS.filter((b) => b !== 'Other'), ...customBreeds]));
  }, [puppies]);

  // Filter puppies locally by search & category
  const filteredPuppies = puppies.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBreed =
      filterBreed === 'All' ||
      p.breed?.toLowerCase() === filterBreed.toLowerCase();
    const matchesStatus =
      filterStatus === 'All' ||
      (p.availability || p.status) === filterStatus;

    return matchesSearch && matchesBreed && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Heading & Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📊</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Nursery Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Puppies add/delete karein, gallery se photo/video manage karein, aur customer enquiries handle karein.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          {/* Direct Add Puppy Button on Dashboard */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Puppy</span>
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* 5 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Puppies */}
        <div className="col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Puppies</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dog className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {loading ? '...' : stats.totalPuppies}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            In nursery database
          </div>
        </div>

        {/* Available Puppies */}
        <div className="col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-emerald-900/30 hover:border-emerald-800/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-400">Available</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            {loading ? '...' : stats.availablePuppies}
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Ready for adoption
          </div>
        </div>

        {/* Sold Puppies */}
        <div className="col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Sold / Adopted</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-300 tracking-tight">
            {loading ? '...' : stats.soldPuppies}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Successfully placed
          </div>
        </div>

        {/* New Enquiries */}
        <div className="col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-800/60 transition-all shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full m-2 animate-ping"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-400">New Enquiries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
            {loading ? '...' : stats.newEnquiries}
          </div>
          <div className="mt-2 text-[11px] text-blue-500 font-medium">
            Requires initial contact
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-purple-900/30 hover:border-purple-800/50 transition-all shadow-sm group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-purple-400">Total Enquiries</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
            {loading ? '...' : stats.totalEnquiries}
          </div>
          <div className="mt-2 text-[11px] text-purple-500">
            All customer leads
          </div>
        </div>
      </div>

      {/* Quick Operations Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Welcome Kit Festive Promotion is Active
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers receive free 7-day food starter pack, collar & leash, and shampoo. You can update this promotion anytime.
            </p>
          </div>
        </div>
        <Link
          to="/admin/offers"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <span>Manage Offer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ======================================================== */}
      {/* PUPPY INVENTORY & MANAGEMENT DIRECTLY ON DASHBOARD */}
      {/* ======================================================== */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Dog className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                Puppy Inventory Management
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dashboard se hi new puppy add karein, photo/video gallery se upload ya delete karein, aur puppy remove karein.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/puppies"
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors hidden sm:inline"
            >
              Full Page View →
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Puppy</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by puppy name or breed..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Breeds</option>
              {allBreedsList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Status (Available & Sold)</option>
              <option value="Available">Available Only</option>
              <option value="Sold">Sold Only</option>
            </select>
          </div>
        </div>

        {/* Puppies Grid */}
        {puppiesLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading puppies...
          </div>
        ) : filteredPuppies.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
            <Dog className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Puppies Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || filterBreed !== 'All' || filterStatus !== 'All'
                ? 'Try resetting the search filters.'
                : 'Click "+ Add New Puppy" above to add your first puppy.'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Puppy Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPuppies.map((pup) => {
              const id = pup._id || pup.id;
              const isAvailable =
                (pup.availability || pup.status) === 'Available';
              const hero =
                pup.images && pup.images.length > 0 ? pup.images[0] : pup.heroImage;

              return (
                <div
                  key={id}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col group transition-all"
                >
                  {/* Media Banner (Photo or Video) */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    {isVideoMedia(hero) ? (
                      <div className="relative w-full h-full bg-slate-950">
                        <video
                          src={hero}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                        <span className="absolute bottom-2 left-2.5 px-1.5 py-0.5 rounded bg-purple-950/90 border border-purple-700/60 text-[9px] font-black text-purple-300 flex items-center gap-1 shadow">
                          <Video className="w-2.5 h-2.5" />
                          <span>VIDEO</span>
                        </span>
                      </div>
                    ) : (
                      <img
                        src={hero}
                        alt={pup.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    )}

                    {/* Status Pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1 ${
                          isAvailable
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-amber-600/90 text-white'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {pup.availability || pup.status}
                      </span>
                    </div>

                    {/* Price Tag */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-md text-amber-300 font-extrabold text-xs border border-amber-500/30">
                        ₹{pup.price?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Media Count Badge */}
                    <div className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] text-slate-300 font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-amber-400" />
                      <span>{pup.images?.length || 1} media</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                          {pup.name}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {pup.gender}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-amber-400 font-medium">
                        <span>{pup.breed}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-[11px]">{pup.age}</span>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {pup.description}
                      </p>
                    </div>

                    {/* Actions: Toggle Sold, Edit (Photo/Video manage), Delete Puppy */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleAvailability(pup)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          isAvailable
                            ? 'bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border-slate-700'
                            : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                        }`}
                        title={isAvailable ? 'Mark as Sold' : 'Mark as Available'}
                      >
                        {isAvailable ? 'Mark Sold' : 'Mark Available'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Edit Puppy Button (Add/Delete Photos/Videos) */}
                        <button
                          onClick={() => handleOpenEditModal(pup)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit details, add or delete puppy photos/videos"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Puppy Button */}
                        <button
                          onClick={() => handleOpenDelete(pup)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 transition-colors"
                          title="Delete puppy from database"
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
      </div>

      {/* Recent Customer Enquiries Section */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-black tracking-tight text-white">
                Recent Customer Enquiries
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest adoption requests submitted from the public website.
            </p>
          </div>

          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Enquiries ({stats.totalEnquiries})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Enquiries List / Table */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading recent enquiries...
          </div>
        ) : !stats.recentEnquiries || stats.recentEnquiries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No enquiries received yet. Any new customer submissions will show up here immediately.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 overflow-x-auto">
            <div className="min-w-[650px]">
              {stats.recentEnquiries.map((inq) => {
                const id = inq._id || inq.id;
                const whatsappUrl = buildWhatsAppUrl(
                  inq.phone,
                  `Hello ${inq.customerName || 'there'}, this is B.tech Puppybala in Bhopal regarding your enquiry for ${
                    inq.puppyName || 'our puppy'
                  }.`
                );

                return (
                  <div
                    key={id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                  >
                    {/* Left: Customer & Puppy Details */}
                    <div className="flex items-start gap-3.5 min-w-[240px]">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0 mt-0.5">
                        {inq.customerName ? inq.customerName[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {inq.customerName}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-600" />
                            {inq.city}
                          </span>
                        </div>
                        <div className="text-xs text-amber-400 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span>Interested in: {inq.puppyName}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 text-[11px]">{inq.breed}</span>
                        </div>
                        {inq.message && (
                          <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1 max-w-md">
                            "{inq.message}"
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {formatDate(inq.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Direct WhatsApp & Call Buttons */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${inq.phone}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-bold transition-colors"
                        title={`Call ${inq.phone}`}
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{inq.phone}</span>
                      </a>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-bold transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Right: Quick Status Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(id, e.target.value)}
                        className={`text-[11px] font-bold py-1.5 px-2.5 rounded-xl border bg-slate-950 focus:outline-none transition-colors cursor-pointer ${statusBadge(
                          inq.status
                        )}`}
                      >
                        <option value="New" className="bg-slate-900 text-blue-400">
                          ● New
                        </option>
                        <option value="Contacted" className="bg-slate-900 text-amber-400">
                          ● Contacted
                        </option>
                        <option value="Follow-up" className="bg-slate-900 text-purple-400">
                          ● Follow-up
                        </option>
                        <option value="Closed" className="bg-slate-900 text-slate-400">
                          ● Closed
                        </option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PUPPY MODAL (WITH GALLERY PHOTO & VIDEO UPLOAD / DELETE) */}
      <PuppyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPuppy(null);
        }}
        isEditing={isEditing}
        initialData={selectedPuppy}
        onSubmit={handlePuppySubmit}
      />

      {/* DELETE PUPPY CONFIRMATION MODAL */}
      <PuppyDeleteModal
        isOpen={deleteModalOpen}
        puppy={puppyToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setPuppyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
