import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/pengisian-ulang`;

export const getAllPengisianUlang = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data pengisian ulang'
  );

  return result.data;
};

export const getPengisianUlangById = async (id) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil detail pengisian ulang'
  );

  return result.data;
};

export const createPengisianUlang = async (data) => {
  return parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal menambahkan data pengisian ulang'
  );
};

export const updatePengisianUlang = async (id, data) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify(data)
    }),
    'Gagal mengubah data pengisian ulang'
  );
};

export const deletePengisianUlang = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus data pengisian ulang'
  );
};
