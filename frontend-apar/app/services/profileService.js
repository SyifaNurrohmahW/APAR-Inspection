import API_BASE_URL from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getProfileById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store'
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengambil data profile');
  }

  return result.data;
};

export const updateProfile = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengubah profile');
  }

  return result;
};

export const updatePassword = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/profile/${id}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengubah password');
  }

  return result;
};