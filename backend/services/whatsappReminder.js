const Notifikasi = require('../models/notifikasi');
const {
  buildAparExpiryMessage,
  sendWhatsappMessage
} = require('./whatsappWebClient');

const runWhatsappExpiryReminders = (callback = () => {}) => {
  Notifikasi.getPendingWhatsappReminders(async (err, reminders) => {
    if (err) {
      return callback(err);
    }

    for (const reminder of reminders) {
      try {
        const result = await sendWhatsappMessage({
          target: reminder.no_hp,
          message: buildAparExpiryMessage(reminder)
        });

        if (result.skipped) {
          return callback(null, {
            total: 0,
            pending: reminders.length,
            skipped: true,
            reason: result.response
          });
        }

        await new Promise((resolve, reject) => {
          Notifikasi.markWhatsappResult(
            reminder.id_notifikasi,
            result.status,
            result.response,
            (markErr) => (markErr ? reject(markErr) : resolve())
          );
        });
      } catch (sendErr) {
        await new Promise((resolve, reject) => {
          Notifikasi.markWhatsappResult(
            reminder.id_notifikasi,
            'failed',
            sendErr.message,
            (markErr) => (markErr ? reject(markErr) : resolve())
          );
        });
      }
    }

    callback(null, { total: reminders.length });
  });
};

module.exports = {
  runWhatsappExpiryReminders
};
