const API_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('medibeauty_token');
}

export async function apiRequest(endpoint, method = 'GET', data) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const options = {
    method,
    headers,
  };
  if (data) options.body = JSON.stringify(data);

  console.log('Making API request to:', endpoint);
  console.log('Method:', method);
  console.log('Headers:', headers);
  console.log('Data:', data);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);

    const text = await res.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { message: text };
    }
    console.log('Response data:', payload);

    if (!res.ok) {
      const message = payload?.message || payload?.error || res.statusText || 'Request failed';
      const error = new Error(message);
      error.status = res.status;
      error.data = payload;
      throw error;
    }

    return payload;
  } catch (error) {
    console.error('API request error:', error);
    if (!(error instanceof Error)) {
      const wrapped = new Error(typeof error === 'string' ? error : 'Network or server error');
      wrapped.data = error;
      throw wrapped;
    }
    throw error;
  }
}

export function setToken(token) {
  localStorage.setItem('medibeauty_token', token);
}
export function clearToken() {
  localStorage.removeItem('medibeauty_token');
}

export const galleryAPI = {
  getPublic: () => apiRequest('/gallery/public'),
  
  getItems: () => apiRequest('/gallery'),
  
  addItem: (data) => apiRequest('/gallery', 'POST', data),
  
  updateItem: (id, data) => apiRequest(`/gallery/${id}`, 'PUT', data),
  
  deleteItem: (id) => apiRequest(`/gallery/${id}`, 'DELETE')
}; 