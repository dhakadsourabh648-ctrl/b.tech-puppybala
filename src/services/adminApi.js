/**
 * B.tech Puppybala - Admin Panel API Service
 * Secure token management and authenticated admin operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'puppybala_admin_token';
const ADMIN_KEY = 'puppybala_admin_profile';

/**
 * Get current stored authentication token
 */
export function getAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
}

/**
 * Store admin token and profile
 */
export function setAdminAuth(token, admin) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch (err) {
    console.warn('Could not save auth data to localStorage', err);
  }
}

/**
 * Clear stored admin credentials
 */
export function clearAdminAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  } catch (err) {
    console.warn('Could not clear auth data from localStorage', err);
  }
}

/**
 * Get current cached admin profile
 */
export function getStoredAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Helper to generate Authorization headers
 */
function authHeaders(extraHeaders = {}) {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

/**
 * Authenticate Admin
 */
export async function adminLogin(email, password) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Login failed. Please check your credentials.');
  }

  if (json.token && json.admin) {
    setAdminAuth(json.token, json.admin);
  }

  return json;
}

/**
 * Verify token and fetch current admin profile
 */
export async function getAdminProfile() {
  const token = getAdminToken();
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(`${API_BASE_URL}/admin/me`, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    clearAdminAuth();
    throw new Error(json.message || 'Session expired. Please log in again.');
  }

  return json.data;
}

/**
 * Fetch Admin Dashboard Metrics & Recent Inquiries
 */
export async function getAdminDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch dashboard metrics');
  }

  return json.data;
}

/**
 * Get all puppies (Admin view, optionally with search/filters)
 */
export async function adminGetPuppies(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val && val !== 'All' && val !== 'All Breeds') {
      searchParams.append(key, val);
    }
  });

  const url = `${API_BASE_URL}/puppies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch puppies');
  }

  return json.data || [];
}

/**
 * Create a new puppy record
 */
export async function adminCreatePuppy(puppyData) {
  const response = await fetch(`${API_BASE_URL}/puppies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(puppyData),
  });

  const json = await response.json();
  if (!response.ok) {
    const errorMsg = json.message || (json.errors && json.errors.join(', ')) || 'Failed to create puppy';
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Update an existing puppy record
 */
export async function adminUpdatePuppy(id, puppyData) {
  const response = await fetch(`${API_BASE_URL}/puppies/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(puppyData),
  });

  const json = await response.json();
  if (!response.ok) {
    const errorMsg = json.message || (json.errors && json.errors.join(', ')) || 'Failed to update puppy';
    throw new Error(errorMsg);
  }

  return json.data;
}

/**
 * Delete a puppy record
 */
export async function adminDeletePuppy(id) {
  const response = await fetch(`${API_BASE_URL}/puppies/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to delete puppy');
  }

  return json;
}

/**
 * Quick toggle puppy availability (Available / Sold)
 */
export async function adminUpdatePuppyAvailability(id, availability) {
  const response = await fetch(`${API_BASE_URL}/puppies/${id}/availability`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ availability }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update puppy availability');
  }

  return json.data;
}

/**
 * Get all customer enquiries with optional status or search filters
 */
export async function adminGetInquiries(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val && val !== 'All') {
      searchParams.append(key, val);
    }
  });

  const url = `${API_BASE_URL}/inquiries${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch customer enquiries');
  }

  return json.data || [];
}

/**
 * Update enquiry status (New, Contacted, Follow-up, Closed)
 */
export async function adminUpdateInquiryStatus(id, status) {
  const response = await fetch(`${API_BASE_URL}/inquiries/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update enquiry status');
  }

  return json.data;
}

/**
 * Delete an enquiry
 */
export async function adminDeleteInquiry(id) {
  const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to delete enquiry');
  }

  return json;
}

/**
 * Trigger re-sending of WhatsApp thank-you confirmation for an enquiry
 */
export async function adminResendInquiryWhatsApp(id) {
  const response = await fetch(`${API_BASE_URL}/inquiries/${id}/resend-whatsapp`, {
    method: 'POST',
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to re-trigger WhatsApp message');
  }

  return json.data;
}

/**
 * Get WhatsApp API service status and configuration diagnostics
 */
export async function adminGetWhatsAppStatus() {
  const response = await fetch(`${API_BASE_URL}/inquiries/whatsapp/status`, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch WhatsApp status');
  }

  return json.data;
}

/**
 * Get all promotional offers for Admin Panel (Active, Inactive, Expired)
 */
export async function adminGetOffers() {
  const response = await fetch(`${API_BASE_URL}/offers/admin`, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to load offers');
  }

  return json.data || [];
}

/**
 * Get single offer by ID
 */
export async function adminGetOffer(id) {
  const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Offer not found');
  }

  return json.data;
}

/**
 * Create a new promotional offer
 */
export async function adminCreateOffer(offerData) {
  const response = await fetch(`${API_BASE_URL}/offers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(offerData),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to create offer');
  }

  return json.data;
}

/**
 * Update an existing promotional offer
 */
export async function adminUpdateOffer(idOrData, maybeData) {
  let url = `${API_BASE_URL}/offers`;
  let body = idOrData;

  if (typeof idOrData === 'string') {
    url = `${API_BASE_URL}/offers/${idOrData}`;
    body = maybeData;
  } else if (idOrData && (idOrData._id || idOrData.id)) {
    const id = idOrData._id || idOrData.id;
    url = `${API_BASE_URL}/offers/${id}`;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to update offer');
  }

  return json.data;
}

/**
 * Toggle offer active status (Activate / Deactivate)
 */
export async function adminToggleOfferStatus(id, active) {
  const response = await fetch(`${API_BASE_URL}/offers/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ active }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to change offer status');
  }

  return json.data;
}

/**
 * Delete an offer
 */
export async function adminDeleteOffer(id) {
  const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Failed to delete offer');
  }

  return json;
}

/**
 * Upload photos or videos from local gallery/device
 * Supports images (JPG, PNG, WEBP) and videos (MP4, WEBM, MOV)
 */
export async function adminUploadMedia(files) {
  const token = getAdminToken();
  const fileArray = Array.from(files);

  if (fileArray.length === 0) return [];

  const formData = new FormData();
  fileArray.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Media upload failed');
    }

    // Convert relative URLs like /uploads/... to absolute backend URLs if API_BASE_URL has a host
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return json.data.map((item) => {
      const isRelative = item.url.startsWith('/');
      const fullUrl = isRelative ? `${backendOrigin}${item.url}` : item.url;
      return {
        ...item,
        url: fullUrl,
      };
    });
  } catch (err) {
    console.warn('[Upload] Backend upload notice, converting to client DataURL fallback:', err.message);
    // Client-side fallback converting files to Data URLs
    const readAsDataURL = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          url: reader.result,
          originalName: file.name,
          mimetype: file.type,
          isVideo: file.type.startsWith('video/'),
          size: file.size,
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    return await Promise.all(fileArray.map(readAsDataURL));
  }
}
