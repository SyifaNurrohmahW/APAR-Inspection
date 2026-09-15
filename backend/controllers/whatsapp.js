const {
  getWhatsappStatus,
  sendWhatsappMessage
} = require('../services/fonnteService');

exports.startWhatsapp = async (req, res) => {
  const status = await getWhatsappStatus();

  res.status(200).json({
    message: status.ready
      ? 'WhatsApp Fonnte service aktif dan terhubung'
      : 'WhatsApp Fonnte service perlu diperiksa koneksinya',
    data: status
  });
};

exports.getWhatsappStatus = async (req, res) => {
  try {
    const status = await getWhatsappStatus();

    res.status(200).json({
      message: 'Berhasil mengambil status WhatsApp Fonnte service',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil status WhatsApp Fonnte',
      error: error.message
    });
  }
};

exports.sendTestMessage = async (req, res) => {
  const { target, message } = req.body;

  if (!target) {
    return res.status(400).json({
      message: 'Nomor WhatsApp target wajib diisi'
    });
  }

  const msgContent = message || 'Tes pengiriman notifikasi WhatsApp APAR via Fonnte API berhasil terhubung!';

  try {
    const result = await sendWhatsappMessage({
      target,
      message: msgContent
    });

    if (result.status === 'sent') {
      return res.status(200).json({
        message: 'Pesan tes WhatsApp berhasil dikirim',
        data: result
      });
    } else {
      return res.status(400).json({
        message: 'Gagal mengirim pesan tes WhatsApp',
        data: result
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan sistem pengiriman WhatsApp',
      error: error.message
    });
  }
};
