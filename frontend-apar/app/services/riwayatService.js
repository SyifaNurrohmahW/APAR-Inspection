import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/riwayat`;

export const getAllRiwayat = async () => {
  const result = await parseApiResponse(
    await fetch(RESOURCE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil data riwayat'
  );

  return result.data;
};

export const getRiwayatByUserId = async (idUsers) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/user/${idUsers}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil riwayat pengguna'
  );

  return result.data;
};
