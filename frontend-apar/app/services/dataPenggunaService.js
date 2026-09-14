import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/data-pengguna`;

export const getAllPengguna = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data pengguna'
  );

  return result.data;
};

export const getPenggunaById = async (id) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil detail pengguna'
  );

  return result.data;
};

export const createPengguna = async (data) => {
  return parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal menambahkan data pengguna'
  );
};

export const updatePengguna = async (id, data) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal mengubah data pengguna'
  );
};

export const deletePengguna = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus data pengguna'
  );
};
