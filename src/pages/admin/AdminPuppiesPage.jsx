import React, { useState, useEffect } from 'react';
import {
  Dog,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Video,
} from 'lucide-react';
import {
  adminGetPuppies,
  adminCreatePuppy,
  adminUpdatePuppy,
  adminDeletePuppy,
  adminUpdatePuppyAvailability,
} from '../../services/adminApi';
import { isVideoMedia } from '../../utils/mediaUtils';
import PuppyModal, { COMMON_BREEDS } from '../../components/admin/PuppyModal';
import PuppyDeleteModal from '../../components/admin/PuppyDeleteModal';

export default function AdminPuppiesPage() {
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBreed, setFilterBreed] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState(null);

  // Delete Dialog State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [puppyToDelete, setPuppyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Success Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchPuppiesList = async () => {
    try {
      setLoading(true);
      const data = await adminGetPuppies();
      setPuppies(data || []);
    } catch (err) {
      console.warn('Error fetching puppies:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Manage Puppies | B.tech Puppybala Admin';
    fetchPuppiesList();
  }, []);

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

  // Open modal for Adding new puppy
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedPuppy(null);
    setModalOpen(true);
  };

  // Open modal for Editing existing puppy
  const handleOpenEditModal = (pup) => {
    setIsEditing(true);
    setSelectedPuppy(pup);
    setModalOpen(true);
  };

  // Handle Add/Edit Form Submit
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
  };

  // Quick Toggle Availability
  const handleToggleAvailability = async (pup) => {
    const id = pup._id || pup.id;
    const current = pup.availability || pup.status;
    const nextStatus = current === 'Available' ? 'Sold' : 'Available';

    try {
      await adminUpdatePuppyAvailability(id, nextStatus);
      showToast(`Marked "${pup.name}" as ${nextStatus}!`);
      // Optimistic local update
      setPuppies((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === id) {
            return { ...p, availability: nextStatus, status: nextStatus };
          }
          return p;
        })
      );
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  // Open delete dialog
  const handleOpenDelete = (pup) => {
    setPuppyToDelete(pup);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!puppyToDelete) return;
    const id = puppyToDelete._id || puppyToDelete.id;

    try {
      setDeleting(true);
      await adminDeletePuppy(id);
      showToast(`Puppy "${puppyToDelete.name}" deleted successfully.`);
      setPuppies((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setDeleteConfirmOpen(false);
      setPuppyToDelete(null);
    } catch (err) {
      alert('Failed to delete puppy: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🐶</span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Puppy Inventory Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Add new puppies, update prices, manage photos & videos, and toggle Available/Sold statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Puppy</span>
        </button>
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

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by puppy name, breed, or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5">
          {/* Breed Filter */}
          <select
            value={filterBreed}
            onChange={(e) => setFilterBreed(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Breeds</option>
            {allBreedsList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Status</option>
            <option value="Available">Available Only</option>
            <option value="Sold">Sold Only</option>
          </select>

          <button
            onClick={fetchPuppiesList}
            className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Reload puppies"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Puppies Grid / Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
          Loading puppy inventory...
        </div>
      ) : filteredPuppies.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800/80 p-8">
          <Dog className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Puppies Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || filterBreed !== 'All' || filterStatus !== 'All'
              ? 'No puppies match the active filter criteria. Try resetting filters.'
              : 'Start by adding your first puppy to the nursery catalog.'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Puppy</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPuppies.map((pup) => {
            const id = pup._id || pup.id;
            const isAvailable =
              (pup.availability || pup.status) === 'Available';
            const hero =
              pup.images && pup.images.length > 0 ? pup.images[0] : pup.heroImage;

            return (
              <div
                key={id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm flex flex-col group transition-all"
              >
                {/* Puppy Image / Video Banner */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
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
                      <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-700/60 text-[10px] font-bold text-purple-300 flex items-center gap-1 backdrop-blur-sm z-10">
                        <Video className="w-3 h-3 text-purple-400" />
                        <span>Video</span>
                      </span>
                    </div>
                  ) : (
                    <img
                      src={hero}
                      alt={pup.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80';
                      }}
                    />
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-md flex items-center gap-1.5 ${
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
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 font-extrabold text-xs border border-amber-500/30">
                      ₹{pup.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Media count indicator */}
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-slate-300 font-medium flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-amber-400" />
                    <span>{pup.images?.length || 1} media</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                        {pup.name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {pup.gender}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-amber-400 font-medium">
                      <span>{pup.breed}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{pup.age}</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {pup.description}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Toggle Availability Button */}
                    <button
                      onClick={() => handleToggleAvailability(pup)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isAvailable
                          ? 'bg-slate-800 hover:bg-amber-950/60 text-slate-300 hover:text-amber-300 border-slate-700'
                          : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                      }`}
                      title={
                        isAvailable
                          ? 'Click to Mark as Sold'
                          : 'Click to Mark as Available'
                      }
                    >
                      {isAvailable ? 'Mark Sold' : 'Mark Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(pup)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit puppy details & media"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleOpenDelete(pup)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 transition-colors"
                        title="Delete puppy"
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

      {/* ADD / EDIT PUPPY MODAL */}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <PuppyDeleteModal
        isOpen={deleteConfirmOpen}
        puppy={puppyToDelete}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPuppyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
