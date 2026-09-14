const Inspeksi = require('../models/inspeksi');
const Riwayat = require('../models/riwayat');
const Notifikasi = require('../models/notifikasi');

exports.getAllInspeksi = (req, res) => {
  Inspeksi.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data inspeksi',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data inspeksi',
      data: results
    });
  });
};

exports.getInspeksiById = (req, res) => {
  const { id } = req.params;

  Inspeksi.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail inspeksi',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data inspeksi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail inspeksi',
      data: results[0]
    });
  });
};

exports.createInspeksi = (req, res) => {
  const {
    id_apar,
    tanggal_inspeksi,
    kondisi_tekanan,
    hasil,
    catatan
  } = req.body;

  if (!id_apar || !tanggal_inspeksi || !kondisi_tekanan || !hasil) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_apar, tanggal_inspeksi, kondisi_tekanan, dan hasil'
    });
  }

  const data = {
    id_apar,
    tanggal_inspeksi,
    kondisi_tekanan,
    hasil,
    catatan
  };

  Inspeksi.create(data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menambahkan data inspeksi',
        error: err
      });
    }

    const id_inspeksi = results.insertId;
    const id_users = req.user?.id_users;

    if (!id_users) {
      return res.status(201).json({
        message: 'Berhasil menambahkan data inspeksi, tetapi riwayat tidak dibuat karena user login tidak terbaca',
        data: {
          id_inspeksi,
          ...data
        }
      });
    }

    Riwayat.create({ id_users, id_inspeksi }, (riwayatErr, riwayatResults) => {
      if (riwayatErr) {
        return res.status(500).json({
          message: 'Inspeksi berhasil ditambahkan, tetapi gagal menambahkan riwayat',
          error: riwayatErr
        });
      }

      const normalizedHasil = String(hasil || '').toLowerCase();
      const normalizedTekanan = String(kondisi_tekanan || '').toLowerCase();
      const isBermasalah = normalizedHasil !== 'baik' || normalizedTekanan !== 'normal';

      Notifikasi.createForEligibleUsers(
        {
          id_riwayat: riwayatResults.insertId,
          id_apar,
          jenis_notifikasi: 'inspeksi',
          pesan: isBermasalah
            ? 'APAR perlu tindak lanjut inspeksi.'
            : 'Inspeksi APAR tercatat.',
          tingkat: isBermasalah ? 'danger' : 'info'
        },
        (notifikasiErr) => {
          if (notifikasiErr) {
            return res.status(500).json({
              message: 'Inspeksi dan riwayat berhasil ditambahkan, tetapi gagal menambahkan notifikasi',
              error: notifikasiErr
            });
          }

          res.status(201).json({
            message: 'Berhasil menambahkan data inspeksi, riwayat, dan notifikasi',
            data: {
              id_inspeksi,
              id_riwayat: riwayatResults.insertId,
              ...data
            }
          });
        }
      );
    });
  });
};

exports.updateInspeksi = (req, res) => {
  const { id } = req.params;

  const {
    id_apar,
    tanggal_inspeksi,
    kondisi_tekanan,
    hasil,
    catatan
  } = req.body;

  if (!id_apar || !tanggal_inspeksi || !kondisi_tekanan || !hasil) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_apar, tanggal_inspeksi, kondisi_tekanan, dan hasil'
    });
  }

  const data = {
    id_apar,
    tanggal_inspeksi,
    kondisi_tekanan,
    hasil,
    catatan
  };

  Inspeksi.update(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah data inspeksi',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data inspeksi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah data inspeksi',
      data: {
        id_inspeksi: id,
        ...data
      }
    });
  });
};

exports.patchInspeksi = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Inspeksi.updatePartial(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah sebagian data inspeksi',
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
        message: 'Data inspeksi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah sebagian data inspeksi',
      data: {
        id_inspeksi: id,
        ...data
      }
    });
  });
};

exports.deleteInspeksi = (req, res) => {
  const { id } = req.params;

  Inspeksi.delete(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus data inspeksi',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data inspeksi tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil menghapus data inspeksi'
    });
  });
};
