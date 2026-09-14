const {
  getWhatsappStatus,
  initializeWhatsappClient
} = require('../services/whatsappWebClient');

exports.startWhatsapp = (req, res) => {
  initializeWhatsappClient();

  res.status(200).json({
    message: 'WhatsApp service sedang disiapkan. Scan QR di terminal backend jika muncul.',
    data: getWhatsappStatus()
  });
};

exports.getWhatsappStatus = (req, res) => {
  res.status(200).json({
    message: 'Berhasil mengambil status WhatsApp service',
    data: getWhatsappStatus()
  });
};
