import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/inspeksi`;

export const getAllInspeksi = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data inspeksi'
  );

  return result.data;
};

export const getInspeksiById = async (id) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil detail inspeksi'
  );

  return result.data;
};

export const createInspeksi = async (data) => {
  return parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal menambahkan data inspeksi'
  );
};

export const updateInspeksi = async (id, data) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal mengubah data inspeksi'
  );
};

export const deleteInspeksi = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus data inspeksi'
  );
};
