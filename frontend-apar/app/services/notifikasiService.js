import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/notifikasi`;

export const getAllNotifikasi = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data notifikasi'
  );

  return result.data;
};

export const getNotifikasiByUserId = async (idUsers) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/user/${idUsers}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil notifikasi pengguna'
  );

  return result.data;
};

export const markAllNotifikasiRead = async () => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    }),
    'Gagal menandai semua notifikasi sebagai dibaca'
  );
};

export const deleteNotifikasi = async (id) => {
  return parseApiResponse(
    await fetch(`${RESOURCE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }),
    'Gagal menghapus notifikasi'
  );
};
