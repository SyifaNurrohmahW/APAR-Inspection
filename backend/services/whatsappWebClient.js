const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client = null;
let isReady = false;
let isInitializing = false;
let latestQr = '';
let lastStatus = 'not_started';

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

  return new Date(value).toLocaleDateString('en-GB', {
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

> _Sent via WhatsApp Service_`;
};

const initializeWhatsappClient = () => {
  if (client || isInitializing) {
    return;
  }

  isInitializing = true;
  lastStatus = 'initializing';

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'apar-inspection'
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    latestQr = qr;
    lastStatus = 'qr';
    console.log('Scan QR berikut untuk login WhatsApp:');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    isInitializing = false;
    latestQr = '';
    lastStatus = 'ready';
    console.log('WhatsApp client siap digunakan');
  });

  client.on('authenticated', () => {
    lastStatus = 'authenticated';
    console.log('WhatsApp client authenticated');
  });

  client.on('auth_failure', (message) => {
    isReady = false;
    isInitializing = false;
    lastStatus = 'auth_failure';
    console.log('Autentikasi WhatsApp gagal:', message);
  });

  client.on('disconnected', async (reason) => {
    isReady = false;
    isInitializing = false;
    lastStatus = 'disconnected';
    console.log('WhatsApp client disconnected:', reason);
    await destroyWhatsappClient();
  });

  client.initialize().catch((error) => {
    isReady = false;
    isInitializing = false;
    lastStatus = 'error';
    console.error('Gagal initialize WhatsApp client:', error.message);
    destroyWhatsappClient();
  });
};

const destroyWhatsappClient = async () => {
  if (client) {
    const tempClient = client;
    client = null;
    isReady = false;
    isInitializing = false;
    try {
      await tempClient.destroy();
    } catch (err) {
      console.error('Error closing WhatsApp client instance:', err.message);
    }
  }
};

process.once('SIGINT', async () => {
  await destroyWhatsappClient();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await destroyWhatsappClient();
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  await destroyWhatsappClient();
  process.kill(process.pid, 'SIGUSR2');
});

const getWhatsappStatus = () => {
  return {
    ready: isReady,
    initializing: isInitializing,
    status: lastStatus,
    hasQr: Boolean(latestQr),
    qr: latestQr
  };
};

const sendWhatsappMessage = async ({ target, message }) => {
  initializeWhatsappClient();

  if (!isReady || !client) {
    return {
      skipped: true,
      status: 'pending',
      response: 'WhatsApp client belum siap. Scan QR dari terminal/backend terlebih dahulu.'
    };
  }

  const normalizedTarget = normalizeWhatsappNumber(target);

  if (!normalizedTarget) {
    return {
      skipped: false,
      status: 'failed',
      response: 'Nomor WhatsApp kosong'
    };
  }

  await client.sendMessage(`${normalizedTarget}@c.us`, message);

  return {
    skipped: false,
    status: 'sent',
    response: 'Pesan berhasil dikirim via WhatsApp Web'
  };
};

module.exports = {
  buildAparExpiryMessage,
  getWhatsappStatus,
  initializeWhatsappClient,
  sendWhatsappMessage,
  destroyWhatsappClient
};

