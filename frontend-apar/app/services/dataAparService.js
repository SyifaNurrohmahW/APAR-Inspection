import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

export const getAllDataApar = async () => {
  const response = await fetch(`${API_BASE_URL}/data-apar`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store'
  });

  const result = await parseApiResponse(response, 'Gagal mengambil data APAR');

  return result.data;
};

export const getDataAparById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/data-apar/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    cache: 'no-store'
  });

  const result = await parseApiResponse(response, 'Gagal mengambil detail APAR');

  return result.data;
};

export const createDataApar = async (data) => {
  const response = await fetch(`${API_BASE_URL}/data-apar`, {
    method: 'POST',
    headers: getAuthHeaders({ json: true }),
    body: JSON.stringify(data)
  });

  const result = await parseApiResponse(response, 'Gagal menambahkan data APAR');

  return result;
};

export const updateDataApar = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/data-apar/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ json: true }),
    body: JSON.stringify(data)
  });

  const result = await parseApiResponse(response, 'Gagal mengubah data APAR');

  return result;
};

export const deleteDataApar = async (id) => {
  const response = await fetch(`${API_BASE_URL}/data-apar/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const result = await parseApiResponse(response, 'Gagal menghapus data APAR');

  return result;
};
