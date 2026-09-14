import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/jenis-bahan`;

export const getAllJenisBahan = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data master jenis bahan'
  );
  return result;
};

export const getJenisBahanById = async (id) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil detail jenis bahan'
  );
  return result;
};

export const createJenisBahan = async (data) => {
  return parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal membuat jenis bahan baru'
  );
};

export const updateJenisBahan = async (id, data) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal memperbarui jenis bahan'
  );
};

export const deleteJenisBahan = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus jenis bahan'
  );
};
