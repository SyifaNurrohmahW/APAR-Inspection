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

export const getActiveShip = () => {
  if (typeof window === 'undefined') {
    return { id: 'all', nama: 'Semua Kapal' };
  }

  const storedUser = localStorage.getItem('user');
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const isSuperadmin = String(user?.role || '').toLowerCase() === 'superadmin';

  // Jika bukan superadmin, selalu kunci ke kapal yang ditugaskan ke user
  if (user && !isSuperadmin) {
    return {
      id: user.id_kapal ? String(user.id_kapal) : '0',
      nama: user.nama_kapal || (user.id_kapal ? `Kapal #${user.id_kapal}` : 'Belum Ditugaskan')
    };
  }

  // Jika superadmin, gunakan pilihan dari localStorage atau default ke 'all'
  const savedId = localStorage.getItem('selected_id_kapal') || 'all';
  const savedNama = localStorage.getItem('selected_nama_kapal') || 'Semua Kapal';

  return {
    id: savedId,
    nama: savedNama
  };
};

export const setActiveShip = (id, nama) => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('selected_id_kapal', String(id));
  localStorage.setItem('selected_nama_kapal', String(nama));

  window.dispatchEvent(
    new CustomEvent('apar-ship-changed', {
      detail: { id: String(id), nama: String(nama) }
    })
  );
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

  const activeShip = getActiveShip();
  if (activeShip && activeShip.id && activeShip.id !== 'all') {
    headers['X-Id-Kapal'] = String(activeShip.id);
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
