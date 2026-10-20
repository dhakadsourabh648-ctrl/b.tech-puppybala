import React, { useState, useEffect, useRef } from 'react';
import {
  Dog,
  UploadCloud,
  FolderPlus,
  Video,
  Play,
  Star,
  X,
  AlertCircle,
  Plus,
  ChevronDown,
  Check,
} from 'lucide-react';
import { adminUploadMedia } from '../../services/adminApi';
import { isVideoMedia } from '../../utils/mediaUtils';
import { triggerClickRipple } from '../../utils/ripple';

export const COMMON_BREEDS = [
  'Golden Retriever',
  'Labrador Retriever',
  'Beagle',
  'Shih Tzu',
  'German Shepherd',
  'Siberian Husky',
  'French Bulldog',
  'Pomeranian',
  'Cocker Spaniel',
  'Rottweiler',
];

export const DEFAULT_PUPPY_FORM = {
  name: '',
  breed: '',
  age: '45 Days',
  gender: 'Male',
  price: 22000,
  availability: 'Available',
  description: '',
  images: [],
};

export default function PuppyModal({
  isOpen,
  onClose,
  initialData = null,
  isEditing = false,
  onSubmit,
}) {
  const [formData, setFormData] = useState(DEFAULT_PUPPY_FORM);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Searchable Breed Dropdown State
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const breedContainerRef = useRef(null);

  // Gallery File Upload State
  const fileInputRef = useRef(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        setFormData({
          name: initialData.name || '',
          breed: initialData.breed || '',
          age: initialData.age || '45 Days',
          gender: initialData.gender || 'Male',
          price: initialData.price || 0,
          availability: initialData.availability || initialData.status || 'Available',
          description: initialData.description || '',
          images: Array.isArray(initialData.images) && initialData.images.length > 0
            ? [...initialData.images]
            : initialData.heroImage
            ? [initialData.heroImage]
            : [],
        });
      } else {
        setFormData({
          name: '',
          breed: '',
          age: '45 Days',
          gender: 'Male',
          price: 22000,
          availability: 'Available',
          description: '',
          images: [],
        });
      }
      setFormError('');
      setUploadError('');
      setNewImageUrl('');
      setShowUrlInput(false);
      setIsBreedDropdownOpen(false);
    }
  }, [isOpen, initialData, isEditing]);

  // Click outside listener for breed suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (breedContainerRef.current && !breedContainerRef.current.contains(e.target)) {
        setIsBreedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  // Handle local gallery photo & video selection
  const handleFilesSelected = async (e) => {
    const files = e.target?.files || e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    setUploadError('');

    try {
      const uploadedResults = await adminUploadMedia(files);
      const newUrls = uploadedResults.map((item) => item.url);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    } catch (err) {
      setUploadError(err.message || 'Gallery se photo/video upload karne me problem aayi.');
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete photo or video from gallery list
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Set photo or video as Cover / Hero (index 0)
  const handleSetHeroMedia = (indexToHero) => {
    setFormData((prev) => {
      const images = [...prev.images];
      const [selected] = images.splice(indexToHero, 1);
      images.unshift(selected);
      return { ...prev, images };
    });
  };

  // Add external image/video URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()],
    }));
    setNewImageUrl('');
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Please enter puppy name.');
      return;
    }

    const resolvedBreed = (formData.breed || '').trim();

    if (!resolvedBreed) {
      setFormError('Please enter or select a puppy breed (e.g. Indian Spitz, Labrador Retriever).');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please enter puppy description.');
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      setFormError('Please upload at least one puppy photo or video.');
      return;
    }

    if (Number(formData.price) <= 0) {
      setFormError('Adoption price must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        breed: resolvedBreed,
        age: formData.age.trim(),
        gender: formData.gender,
        price: Number(formData.price),
        availability: formData.availability,
        description: formData.description.trim(),
        images: formData.images,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to save puppy details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Dog className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Edit Puppy: ${formData.name}` : 'Add New Puppy'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Photo, video, price aur availability seedhe live website aur database par save honge.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Puppy Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Puppy Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Leo, Bella, Milo"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Price (INR) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adoption Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="22000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Searchable & Custom Breed Field */}
            <div className="relative" ref={breedContainerRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Breed *
                </label>
                {formData.breed?.trim() &&
                  !COMMON_BREEDS.some(
                    (b) => b.toLowerCase() === formData.breed.trim().toLowerCase()
                  ) && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Custom Breed
                    </span>
                  )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.breed}
                  onChange={(e) => {
                    setFormData({ ...formData, breed: e.target.value });
                    setIsBreedDropdownOpen(true);
                  }}
                  onFocus={() => setIsBreedDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsBreedDropdownOpen(false);
                  }}
                  placeholder="Type or select breed..."
                  autoComplete="off"
                  className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setIsBreedDropdownOpen((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title="Show breed suggestions"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isBreedDropdownOpen ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Suggestions / Custom Value Popup */}
              {isBreedDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-700/90 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto divide-y divide-slate-800/80 backdrop-blur-md">
                  {/* Option 1: Explicit Custom Breed Option if typing something not in list */}
                  {formData.breed?.trim() &&
                    !COMMON_BREEDS.some(
                      (b) => b.toLowerCase() === formData.breed.trim().toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFormData({ ...formData, breed: formData.breed.trim() });
                          setIsBreedDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-amber-950/40 text-amber-300 text-xs flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            Use <strong className="font-bold text-white">"{formData.breed.trim()}"</strong>
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Custom Breed
                        </span>
                      </button>
                    )}

                  {/* Option 2: Predefined Common Breeds filtered by search */}
                  {COMMON_BREEDS.filter((b) =>
                    b.toLowerCase().includes((formData.breed || '').trim().toLowerCase())
                  ).length > 0 ? (
                    COMMON_BREEDS.filter((b) =>
                      b.toLowerCase().includes((formData.breed || '').trim().toLowerCase())
                    ).map((b) => {
                      const isSelected =
                        formData.breed?.trim().toLowerCase() === b.toLowerCase();
                      return (
                        <button
                          key={b}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setFormData({ ...formData, breed: b });
                            setIsBreedDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <span>{b}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        </button>
                      );
                    })
                  ) : !formData.breed?.trim() ? (
                    <div className="px-3 py-3 text-center text-[11px] text-slate-500">
                      Type any custom breed name above.
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Age (e.g. "45 Days") *
              </label>
              <input
                type="text"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="45 Days / 2 Months"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Availability Status *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modal-availability"
                  value="Available"
                  checked={formData.availability === 'Available'}
                  onChange={() => setFormData({ ...formData, availability: 'Available' })}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-emerald-400">
                  Available (Ready for Adoption)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modal-availability"
                  value="Sold"
                  checked={formData.availability === 'Sold'}
                  onChange={() => setFormData({ ...formData, availability: 'Sold' })}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-slate-400">
                  Sold / Adopted
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe puppy personality, home-raised habits, and socialization..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* PHOTO & VIDEO MEDIA MANAGEMENT */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-200">
                  Puppy Photos & Videos (Gallery se Upload & Delete) *
                </label>
                <p className="text-[11px] text-slate-400">
                  Phone ya computer gallery se photos aur videos upload karein, ya kisi bhi file ko delete karein.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400">
                {formData.images.length} media file(s)
              </span>
            </div>

            {/* Gallery Upload Dropzone / File Picker */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFilesSelected(e);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group select-none ${
                isDragOver
                  ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/80 hover:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFilesSelected}
                className="hidden"
              />

              {uploadingFiles ? (
                <div className="py-4 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-amber-400">
                    Gallery se photos aur videos upload ho rahe hain...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Kripya intezar karein, files save ho rahi hain.
                  </p>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-lg shadow-amber-500/10">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-all">
                      <FolderPlus className="w-4 h-4" />
                      <span>📁 Apni Gallery se Photos / Videos Chunein</span>
                    </span>
                    <p className="text-[11px] text-slate-300 mt-2 font-medium">
                      Click karke device gallery kholein ya photos/videos yahan drag karein
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Photos (JPG, PNG, WEBP) & Videos (MP4, WEBM, MOV) • Max 50MB per file
                    </p>
                  </div>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Current Media Grid (With Photo/Video deletion) */}
            {formData.images.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Uploaded Gallery Media ({formData.images.length})
                  </span>
                  <span className="text-[10px] text-amber-400">
                    ⭐ Cover: Pehli photo/video card par dikhegi. Hover karke ✕ se delete karein.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {formData.images.map((imgUrl, index) => {
                    const isVideo = isVideoMedia(imgUrl);
                    return (
                      <div
                        key={index}
                        className={`relative rounded-xl overflow-hidden border bg-slate-950 group h-24 sm:h-28 transition-all ${
                          index === 0
                            ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-md'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isVideo ? (
                          <div className="w-full h-full relative bg-slate-900">
                            <video
                              src={imgUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                              <div className="w-7 h-7 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow">
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-purple-950/95 border border-purple-700 text-[9px] font-black text-purple-300 flex items-center gap-1 shadow">
                              <Video className="w-2.5 h-2.5" />
                              <span>VIDEO</span>
                            </span>
                          </div>
                        ) : (
                          <img
                            src={imgUrl}
                            alt="Puppy media"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        )}

                        {/* Cover Badge or Action */}
                        {index === 0 ? (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-amber-500 text-[9px] font-black text-slate-950 shadow flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-slate-950" />
                            <span>Cover</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetHeroMedia(index)}
                            className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-slate-950 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all border border-slate-700 shadow"
                            title="Set this as cover"
                          >
                            Set Cover
                          </button>
                        )}

                        {/* Delete this specific photo / video button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          title="Delete this photo/video"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Secondary Option: URL */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>{showUrlInput ? '▼' : '►'}</span>
                <span>Online Photo/Video URL paste karein</span>
              </button>

              {showUrlInput && (
                <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-fade-in">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Paste image or video URL (https://...)"
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900 pb-1">
            <button
              type="button"
              onClick={(e) => {
                triggerClickRipple(e, 'rgba(255, 255, 255, 0.2)');
                onClose();
              }}
              className="btn-tactile px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              onClick={(e) => triggerClickRipple(e, 'rgba(0, 0, 0, 0.3)')}
              className="btn-tactile px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Update Puppy'
                : 'Create Puppy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
