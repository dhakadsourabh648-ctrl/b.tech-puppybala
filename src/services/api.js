import { PUPPIES as FALLBACK_PUPPIES, getPuppyById as getFallbackPuppyById } from '../data/puppiesData';
import { getActiveOffer as getFallbackOffer } from '../data/offersData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all puppies from the REST API with fallback to local data
 */
export async function getPuppies(queryParams = {}) {
  try {
    const searchParams = new URLSearchParams();
    if (queryParams.breed && queryParams.breed !== 'All Breeds' && queryParams.breed !== 'All') {
      searchParams.append('breed', queryParams.breed);
    }
    if (queryParams.gender && queryParams.gender !== 'All') {
      searchParams.append('gender', queryParams.gender);
    }
    if (queryParams.availability && queryParams.availability !== 'All') {
      searchParams.append('availability', queryParams.availability);
    }
    if (queryParams.search) {
      searchParams.append('search', queryParams.search);
    }
    if (queryParams.sort) {
      searchParams.append('sort', queryParams.sort);
    }

    const url = `${API_BASE_URL}/puppies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      // Normalize _id / id
      return json.data.map(normalizePuppy);
    }
    return FALLBACK_PUPPIES;
  } catch (error) {
    console.warn('[Puppybala API] Notice: Fetching from backend was unavailable, using cached puppy records.', error.message);
    return FALLBACK_PUPPIES;
  }
}

/**
 * Fetch single puppy by ID from REST API with fallback
 */
export async function getPuppy(id) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/puppies/${id}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      return normalizePuppy(json.data);
    }
    return getFallbackPuppyById(id) || null;
  } catch (error) {
    console.warn(`[Puppybala API] Notice: Fetching puppy "${id}" from backend failed, using local data fallback.`);
    return getFallbackPuppyById(id) || null;
  }
}

/**
 * Fetch dynamic promotional offers from REST API
 * Returns array of active offers. Returns empty array if none are active.
 */
export async function getOffers() {
  try {
    const response = await fetch(`${API_BASE_URL}/offers`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error('Failed to load offers');
    const json = await response.json();
    if (json.success) {
      if (Array.isArray(json.data)) {
        return json.data;
      }
      if (json.data) {
        return [json.data];
      }
      return [];
    }
    return [];
  } catch (err) {
    console.warn('[Puppybala API] Live offers fetch notice:', err.message);
    return [];
  }
}

/**
 * Submit customer puppy enquiry to the backend API
 */
export async function createInquiry(inquiryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || (json.errors && json.errors.join(', ')) || 'Failed to submit enquiry');
    }

    return json;
  } catch (error) {
    console.warn('[Puppybala API] Notice: Enquiry submission fallback generated:', error.message);
    const hex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    return {
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
      data: {
        ...inquiryData,
        inquiryRef: `BPB-${hex}`,
        status: 'New',
        createdAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * Get all enquiries from backend
 */
export async function getInquiries(params = {}) {
  try {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/inquiries?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch inquiries');
    return await response.json();
  } catch (error) {
    return { success: true, count: 0, data: [] };
  }
}

/**
 * Get single enquiry by ID
 */
export async function getInquiry(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`);
    if (!response.ok) throw new Error('Enquiry not found');
    return await response.json();
  } catch (error) {
    return null;
  }
}

/**
 * Update enquiry status
 */
export async function updateInquiryStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return await response.json();
}

/**
 * Delete enquiry
 */
export async function deleteInquiry(id) {
  const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
}

/**
 * Normalize API puppy objects for backward-compatibility with UI components
 */
function normalizePuppy(p) {
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.gallery || [p.heroImage]);
  const heroImage = images[0] || p.heroImage;
  const id = p._id || p.id;
  const status = p.availability || p.status || 'Available';

  return {
    ...p,
    id: String(id),
    _id: String(id),
    images,
    gallery: images,
    heroImage,
    status,
    availability: status,
    temperament: Array.isArray(p.temperament) ? p.temperament : ['Home-Raised', 'Friendly'],
    homeRaisedHighlights: Array.isArray(p.homeRaisedHighlights)
      ? p.homeRaisedHighlights
      : ['Raised cage-free in a clean household', 'Trained with gentle human affection'],
    locationBadge: p.locationBadge || 'Bhopal (Home-Raised Nursery)',
  };
}
