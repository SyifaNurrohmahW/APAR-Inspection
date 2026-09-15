const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';

const getFormattedApiUrl = (url) => {
  if (!url) return 'http://localhost:7000/api';
  let formatted = url.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  if (!formatted.endsWith('/api') && !formatted.endsWith('/api/')) {
    formatted = formatted.replace(/\/+$/, '') + '/api';
  }
  return formatted.replace(/\/+$/, '');
};

const API_BASE_URL = getFormattedApiUrl(rawApiUrl);

export const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('token') || '';
};

export const getAuthHeaders = ({ json = false } = {}) => {
  const token = getAuthToken();
  const headers = {};

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const parseApiResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(
      `${fallbackMessage}. Pastikan backend berjalan di ${API_BASE_URL}`
    );
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || fallbackMessage);
  }

  return result;
};

export default API_BASE_URL;
