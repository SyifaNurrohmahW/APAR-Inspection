const normalizeWhatsappNumber = (value) => {
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }

  if (!digits.startsWith('62')) {
    return `62${digits}`;
  }

  return digits;
};

const formatExpiredDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const buildAparExpiryMessage = (item) => {
  const title =
    Number(item.sisa_hari) < 0 ||
    String(item.status_apar || '').toLowerCase() === 'kedaluwarsa'
      ? 'APAR Sudah Kedaluwarsa'
      : 'APAR Akan Kedaluwarsa';

  return `*[Pengingat ${title}]*

Kode APAR: *${item.kode_apar || '-'}*
Lokasi: *${item.lokasi || '-'}*
Jenis APAR: *${item.jenis || '-'}*
Tanggal Expired: *${formatExpiredDate(item.tanggal_kadaluwarsa)}*

Segera !!! lakukan pengecekan dan pengisian ulang APAR agar bisa diproses sesuai kebutuhan keselamatan, lalu berkoordinasi dengan petugas terkait.

> _Sent via WhatsApp Service (Fonnte)_`;
};

const getWhatsappStatus = async () => {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    return {
      ready: false,
      status: 'no_token',
      message: 'FONNTE_TOKEN belum dikonfigurasi pada file .env'
    };
  }

  try {
    const response = await fetch('https://api.fonnte.com/device', {
      method: 'POST',
      headers: {
        'Authorization': token
      }
    });

    const data = await response.json();

    if (data.status) {
      const isConnected =
        data.device_status === 'connect' || data.device_status === 'connected';

      return {
        ready: isConnected,
        status: data.device_status || 'connected',
        device: data.device || null,
        name: data.name || null,
        quota: data.quota || null,
        message: isConnected
          ? 'Fonnte WhatsApp API terhubung dan siap digunakan'
          : `Perangkat Fonnte status: ${data.device_status || 'Disconnected'}`
      };
    }

    return {
      ready: false,
      status: 'disconnected',
      message: data.reason || 'Token Fonnte tidak valid atau perangkat belum terhubung'
    };
  } catch (error) {
    return {
      ready: false,
      status: 'error',
      message: `Gagal terhubung ke Fonnte API: ${error.message}`
    };
  }
};

const sendWhatsappMessage = async ({ target, message }) => {
  const token = process.env.FONNTE_TOKEN;

  if (!token) {
    return {
      skipped: true,
      status: 'pending',
      response: 'FONNTE_TOKEN belum dikonfigurasi pada file .env'
    };
  }

  const normalizedTarget = normalizeWhatsappNumber(target);

  if (!normalizedTarget) {
    return {
      skipped: false,
      status: 'failed',
      response: 'Nomor WhatsApp target kosong atau format salah'
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('target', normalizedTarget);
    params.append('message', message);
    params.append('countryCode', '62');

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: params
    });

    const data = await response.json();

    if (data.status) {
      return {
        skipped: false,
        status: 'sent',
        response: data.reason || 'Pesan berhasil dikirim via Fonnte'
      };
    } else {
      return {
        skipped: false,
        status: 'failed',
        response: data.reason || 'Gagal mengirim pesan via Fonnte'
      };
    }
  } catch (error) {
    return {
      skipped: false,
      status: 'failed',
      response: `Gagal koneksi ke Fonnte API: ${error.message}`
    };
  }
};

module.exports = {
  normalizeWhatsappNumber,
  formatExpiredDate,
  buildAparExpiryMessage,
  getWhatsappStatus,
  sendWhatsappMessage
};
