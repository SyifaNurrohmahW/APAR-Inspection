const Riwayat = require('../models/riwayat');

exports.getAllRiwayat = (req, res) => {
  Riwayat.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data riwayat',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data riwayat',
      data: results
    });
  });
};

exports.getRiwayatById = (req, res) => {
  const { id } = req.params;

  Riwayat.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail riwayat',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data riwayat tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail riwayat',
      data: results[0]
    });
  });
};

exports.getRiwayatByUserId = (req, res) => {
  const { id_users } = req.params;

  Riwayat.getByUserId(id_users, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil riwayat berdasarkan user',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil riwayat berdasarkan user',
      data: results
    });
  });
};

exports.createRiwayat = (req, res) => {
  const { id_users, id_inspeksi } = req.body;

  if (!id_users || !id_inspeksi) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_users dan id_inspeksi'
    });
  }

  const data = {
    id_users,
    id_inspeksi
  };

  Riwayat.create(data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menambahkan data riwayat',
        error: err
      });
    }

    res.status(201).json({
      message: 'Berhasil menambahkan data riwayat',
      data: {
        id_riwayat: results.insertId,
        ...data
      }
    });
  });
};

exports.updateRiwayat = (req, res) => {
  const { id } = req.params;
  const { id_users, id_inspeksi } = req.body;

  if (!id_users || !id_inspeksi) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_users dan id_inspeksi'
    });
  }

  const data = {
    id_users,
    id_inspeksi
  };

  Riwayat.update(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah data riwayat',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data riwayat tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah data riwayat',
      data: {
        id_riwayat: id,
        ...data
      }
    });
  });
};

exports.patchRiwayat = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  Riwayat.updatePartial(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah sebagian data riwayat',
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
        message: 'Data riwayat tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah sebagian data riwayat',
      data: {
        id_riwayat: id,
        ...data
      }
    });
  });
};

exports.deleteRiwayat = (req, res) => {
  const { id } = req.params;

  Riwayat.delete(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus data riwayat',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data riwayat tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil menghapus data riwayat'
    });
  });
};
