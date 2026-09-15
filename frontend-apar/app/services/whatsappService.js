import API_BASE_URL, { getAuthHeaders, parseApiResponse } from './api';

const RESOURCE_URL = `${API_BASE_URL}/whatsapp`;

export const getWhatsappStatus = async () => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    }),
    'Gagal mengambil status WhatsApp Fonnte'
  );

  return result.data;
};

export const syncWhatsappReminders = async () => {
  const result = await parseApiResponse(
    await fetch(`${API_BASE_URL}/notifikasi/send-wa-reminders`, {
      method: 'POST',
      headers: getAuthHeaders()
    }),
    'Gagal mengirim pengingat WhatsApp'
  );

  return result.data;
};

export const sendTestWhatsapp = async (target, message) => {
  const result = await parseApiResponse(
    await fetch(`${RESOURCE_URL}/send-test`, {
      method: 'POST',
      headers: getAuthHeaders({ json: true }),
      body: JSON.stringify({ target, message })
    }),
    'Gagal mengirim pesan tes WhatsApp'
  );

  return result.data;
};
