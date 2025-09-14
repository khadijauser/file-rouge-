const API_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL)
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:5000/api';

export const BASE_URL = API_URL.replace(/\/?api\/?$/, '');

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

export function getToken() {
  return localStorage.getItem('medibeauty_token');
}

export function setToken(token) {
  localStorage.setItem('medibeauty_token', token);
}

export function clearToken() {
  localStorage.removeItem('medibeauty_token');
}

export async function apiRequest(endpoint, method = 'GET', data) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);

  console.log('API Request:', {
    url: `${API_URL}${endpoint}`,
    method,
    headers,
    hasData: !!data
  });

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    const payload = await res.json().catch(() => ({}));
    
    if (!res.ok) {
      console.error('API Error Response:', {
        status: res.status,
        statusText: res.statusText,
        payload
      });
      
      // Handle 403 errors gracefully
      if (res.status === 403) {
        console.warn('Access denied:', payload?.error || 'Insufficient permissions');
        const error = new Error(payload?.error || 'Access denied. You do not have permission to perform this action.');
        error.status = res.status;
        error.data = payload;
        throw error;
      }
      
      const error = new Error(payload?.message || 'Request failed');
      error.status = res.status;
      error.data = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    if (!(error instanceof Error)) {
      const wrapped = new Error(typeof error === 'string' ? error : 'Network or server error');
      wrapped.data = error;
      throw wrapped;
    }
    throw error;
  }
}

export const galleryAPI = {
  getPublic: () => apiRequest('/gallery/public'),
  
  getItems: () => apiRequest('/gallery'),
  
  addItem: (data) => apiRequest('/gallery/data', 'POST', data),
  
  updateItem: (id, data) => apiRequest(`/gallery/${id}/data`, 'PUT', data),
  
  deleteItem: (id) => apiRequest(`/gallery/${id}`, 'DELETE')
};