const Notifikasi = require('../models/notifikasi');
const { runWhatsappExpiryReminders } = require('../services/whatsappReminder');

exports.getAllNotifikasi = (req, res) => {
  const id_users = req.user?.id_users;

  if (!id_users) {
    return res.status(401).json({
      message: 'User login tidak terbaca'
    });
  }

  Notifikasi.ensureExpiringForEligibleUsers((ensureErr) => {
    if (ensureErr) {
      return res.status(500).json({
        message: 'Gagal menyiapkan notifikasi kedaluwarsa',
        error: ensureErr
      });
    }

    runWhatsappExpiryReminders((waErr) => {
      if (waErr) {
        return res.status(500).json({
          message: 'Gagal mengirim pengingat WhatsApp',
          error: waErr
        });
      }

      Notifikasi.getByUserId(id_users, (err, results) => {
        if (err) {
          return res.status(500).json({
            message: 'Gagal mengambil data notifikasi',
            error: err
          });
        }

        res.status(200).json({
          message: 'Berhasil mengambil data notifikasi',
          data: results
        });
      });
    });
  });
};

exports.syncWhatsappReminders = (req, res) => {
  Notifikasi.ensureExpiringForEligibleUsers((ensureErr) => {
    if (ensureErr) {
      return res.status(500).json({
        message: 'Gagal menyiapkan notifikasi kedaluwarsa',
        error: ensureErr
      });
    }

    runWhatsappExpiryReminders((waErr, results) => {
      if (waErr) {
        return res.status(500).json({
          message: 'Gagal mengirim pengingat WhatsApp',
          error: waErr
        });
      }

      res.status(200).json({
        message: 'Berhasil sinkron pengingat WhatsApp',
        data: results
      });
    });
  });
};

exports.getAllNotifikasiLegacy = (req, res) => {
  Notifikasi.getAll((err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengambil data notifikasi',
          error: err
        });
      }

      res.status(200).json({
        message: 'Berhasil mengambil data notifikasi',
        data: results
      });
    });
};

exports.getNotifikasiById = (req, res) => {
  const { id } = req.params;

  Notifikasi.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail notifikasi',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data notifikasi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail notifikasi',
      data: results[0]
    });
  });
};

exports.getNotifikasiByUserId = (req, res) => {
  const { id_users } = req.params;

  Notifikasi.ensureExpiringForUser(id_users, (ensureErr) => {
    if (ensureErr) {
      return res.status(500).json({
        message: 'Gagal menyiapkan notifikasi kedaluwarsa',
        error: ensureErr
      });
    }

    Notifikasi.getByUserId(id_users, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengambil notifikasi berdasarkan user',
          error: err
        });
      }

      res.status(200).json({
        message: 'Berhasil mengambil notifikasi berdasarkan user',
        data: results
      });
    });
  });
};

exports.createNotifikasi = (req, res) => {
  const {
    id_users,
    id_riwayat,
    id_apar,
    jenis_notifikasi,
    pesan,
    tingkat,
    dibaca,
    tanggal_kadaluwarsa
  } = req.body;

  if (!id_users) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_users'
    });
  }

  const data = {
    id_users,
    id_riwayat,
    id_apar,
    jenis_notifikasi,
    pesan,
    tingkat,
    dibaca,
    tanggal_kadaluwarsa
  };

  Notifikasi.create(data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menambahkan data notifikasi',
        error: err
      });
    }

    res.status(201).json({
      message: 'Berhasil menambahkan data notifikasi',
      data: {
        id_notifikasi: results.insertId,
        ...data
      }
    });
  });
};

exports.updateNotifikasi = (req, res) => {
  const { id } = req.params;
  const {
    id_users,
    id_riwayat,
    id_apar,
    jenis_notifikasi,
    pesan,
    tingkat,
    dibaca,
    tanggal_kadaluwarsa
  } = req.body;

  if (!id_users) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_users'
    });
  }

  const data = {
    id_users,
    id_riwayat,
    id_apar,
    jenis_notifikasi,
    pesan,
    tingkat,
    dibaca,
    tanggal_kadaluwarsa
  };

  Notifikasi.update(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah data notifikasi',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data notifikasi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah data notifikasi',
      data: {
        id_notifikasi: id,
        ...data
      }
    });
  });
};

exports.patchNotifikasi = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Notifikasi.updatePartial(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah sebagian data notifikasi',
        error: err
      });
    }

    if (results.noFields) {
      return res.status(400).json({
        message: 'Minimal kirim satu field valid untuk diubah'
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data notifikasi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah sebagian data notifikasi',
      data: {
        id_notifikasi: id,
        ...data
      }
    });
  });
};

exports.markAllRead = (req, res) => {
  const id_users = req.user?.id_users;

  if (!id_users) {
    return res.status(401).json({
      message: 'User login tidak terbaca'
    });
  }

  Notifikasi.markAllReadByUserId(id_users, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menandai semua notifikasi sebagai dibaca',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil menandai semua notifikasi sebagai dibaca',
      data: results
    });
  });
};

exports.deleteNotifikasi = (req, res) => {
  const { id } = req.params;
  const id_users = req.user?.id_users;

  if (!id_users) {
    return res.status(401).json({
      message: 'User login tidak terbaca'
    });
  }

  Notifikasi.delete(id, id_users, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus data notifikasi',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data notifikasi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil menghapus data notifikasi'
    });
  });
};
