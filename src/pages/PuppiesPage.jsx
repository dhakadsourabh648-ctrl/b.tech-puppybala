import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal, PawPrint } from 'lucide-react';
import PuppyCard from '../components/PuppyCard';
import { PUPPIES } from '../data/puppiesData';
import { getPuppies } from '../services/api';
import { triggerClickRipple } from '../utils/ripple';

export default function PuppiesPage({ onOpenEnquiry }) {
  const [puppies, setPuppies] = useState(PUPPIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBreed, setSelectedBreed] = useState('All Breeds');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    document.title = 'Available Puppies | B.tech Puppybala Bhopal';
    let isMounted = true;
    async function fetchFromBackend() {
      try {
        const data = await getPuppies();
        if (isMounted && Array.isArray(data)) {
          setPuppies(data);
        }
      } catch (e) {
        // Fallback already handled
      }
    }
    fetchFromBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  const breeds = useMemo(() => {
    const list = Array.from(new Set(puppies.map((p) => p.breed).filter(Boolean)));
    return ['All Breeds', ...list];
  }, [puppies]);

  // Filter & Sort Logic
  const filteredPuppies = useMemo(() => {
    return puppies.filter((puppy) => {
      // 1. Search filter
      const matchesSearch =
        (puppy.name && puppy.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (puppy.breed && puppy.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (Array.isArray(puppy.temperament) &&
          puppy.temperament.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      // 2. Breed filter
      if (selectedBreed !== 'All Breeds' && puppy.breed?.toLowerCase() !== selectedBreed.toLowerCase()) {
        return false;
      }

      // 3. Gender filter
      if (selectedGender !== 'All' && puppy.gender !== selectedGender) {
        return false;
      }

      // 4. Availability filter
      if (selectedAvailability === 'Available' && puppy.status !== 'Available') {
        return false;
      }
      if (selectedAvailability === 'Reserved' && puppy.status === 'Available') {
        return false;
      }

      // 5. Price filter
      if (selectedPriceRange === 'under-20k' && puppy.price >= 20000) return false;
      if (selectedPriceRange === '20k-25k' && (puppy.price < 20000 || puppy.price > 25000)) return false;
      if (selectedPriceRange === 'above-25k' && puppy.price <= 25000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default order
    });
  }, [puppies, searchQuery, selectedBreed, selectedGender, selectedPriceRange, selectedAvailability, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedBreed('All Breeds');
    setSelectedGender('All');
    setSelectedPriceRange('All');
    setSelectedAvailability('All');
    setSortBy('featured');
  };

  const isFiltered =
    searchQuery !== '' ||
    selectedBreed !== 'All Breeds' ||
    selectedGender !== 'All' ||
    selectedPriceRange !== 'All' ||
    selectedAvailability !== 'All' ||
    sortBy !== 'featured';

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-orange-500/10 rounded-3xl p-6 sm:p-10 border border-amber-200/60">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <PawPrint className="w-3.5 h-3.5 text-amber-600" />
            <span>Ethical Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
            Explore All Puppies
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Browse our hand-raised puppies in Bhopal. Filter by breed, gender, price, and availability to find your family’s ideal match.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-100 shadow-soft space-y-5">
        
        {/* Top Search Bar & Sort Dropdown */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by breed (e.g. Golden Retriever, Beagle) or name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={(e) => {
                  triggerClickRipple(e, 'rgba(217, 119, 6, 0.2)');
                  setSearchQuery('');
                }}
                className="btn-tactile absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={(e) => {
                triggerClickRipple(e, 'rgba(217, 119, 6, 0.3)');
                setMobileFilterOpen(!mobileFilterOpen);
              }}
              className="btn-tactile flex-1 py-2.5 px-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters & Sort'}</span>
            </button>
            {isFiltered && (
              <button
                onClick={(e) => {
                  triggerClickRipple(e, 'rgba(217, 119, 6, 0.3)');
                  resetFilters();
                }}
                className="btn-tactile p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Controls (Breed, Gender, Price, Availability) */}
        <div className={`space-y-4 pt-3 border-t border-slate-100 ${mobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Breed Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Breed
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-amber-500 focus:outline-hidden"
              >
                {breeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Gender Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Gender
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['All', 'Male', 'Female'].map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={(e) => {
                      triggerClickRipple(e, selectedGender === gen ? 'rgba(255, 255, 255, 0.5)' : 'rgba(217, 119, 6, 0.25)');
                      setSelectedGender(gen);
                    }}
                    className={`btn-tactile py-2 text-xs font-bold rounded-xl transition-colors ${
                      selectedGender === gen
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Price Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="All">All Price Ranges</option>
                <option value="under-20k">Under ₹20,000</option>
                <option value="20k-25k">₹20,000 - ₹25,000</option>
                <option value="above-25k">Above ₹25,000</option>
              </select>
            </div>

            {/* 4. Availability Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Availability Status
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:border-amber-500 focus:outline-hidden"
              >
                <option value="All">All Puppies</option>
                <option value="Available">Available Only</option>
                <option value="Reserved">Reserved / Sold</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Found {filteredPuppies.length} {filteredPuppies.length === 1 ? 'puppy' : 'puppies'}
              </span>
              {selectedBreed !== 'All Breeds' && (
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
                  Breed: {selectedBreed}
                </span>
              )}
              {selectedGender !== 'All' && (
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-semibold">
                  Gender: {selectedGender}
                </span>
              )}
              {selectedAvailability !== 'All' && (
                <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full font-semibold">
                  Status: {selectedAvailability}
                </span>
              )}
            </div>

            {isFiltered && (
              <button
                onClick={(e) => {
                  triggerClickRipple(e, 'rgba(217, 119, 6, 0.25)');
                  resetFilters();
                }}
                className="btn-tactile inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Puppies Grid */}
      {filteredPuppies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPuppies.map((puppy) => (
            <PuppyCard
              key={puppy.id}
              puppy={puppy}
              onOpenEnquiry={onOpenEnquiry}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-amber-100 max-w-lg mx-auto shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <PawPrint className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">
            No matching puppies found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn't find any puppies matching your exact search and filter criteria. You can clear filters or send us a custom inquiry for upcoming litters.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onOpenEnquiry && onOpenEnquiry(null)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              Enquire Upcoming Litters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
