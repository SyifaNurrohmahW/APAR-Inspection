import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/lokasi`;

export const getAllLokasi = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data lokasi'
  );

  return result.data;
};

export const getLokasiById = async (id) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil detail lokasi'
  );

  return result.data;
};

export const createLokasi = async (data) => {
  return parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal menambahkan data lokasi'
  );
};

export const updateLokasi = async (id, data) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal mengubah data lokasi'
  );
};

export const deleteLokasi = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus data lokasi'
  );
};
