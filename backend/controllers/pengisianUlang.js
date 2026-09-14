const PengisianUlang = require('../models/pengisianUlang');

exports.getAllPengisianUlang = (req, res) => {
  PengisianUlang.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data pengisian ulang',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data pengisian ulang',
      data: results
    });
  });
};

exports.getPengisianUlangById = (req, res) => {
  const { id } = req.params;

  PengisianUlang.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail pengisian ulang',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data pengisian ulang tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail pengisian ulang',
      data: results[0]
    });
  });
};

exports.createPengisianUlang = (req, res) => {
  const {
    id_apar,
    tanggal,
    tanggal_kadaluwarsa,
    nama_vendor,
    biaya,
    catatan
  } = req.body;

  if (!id_apar || !tanggal || !tanggal_kadaluwarsa || !nama_vendor || !biaya) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_apar, tanggal, tanggal_kadaluwarsa, nama_vendor, biaya'
    });
  }

  const data = {
    id_apar,
    tanggal,
    tanggal_kadaluwarsa,
    nama_vendor,
    biaya,
    catatan
  };

  PengisianUlang.create(data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menambahkan data pengisian ulang',
        error: err
      });
    }

    res.status(201).json({
      message: 'Berhasil menambahkan data pengisian ulang',
      data: {
        id_return: results.insertId,
        ...data
      }
    });
  });
};

exports.updatePengisianUlang = (req, res) => {
  const { id } = req.params;

  const {
    id_apar,
    tanggal,
    tanggal_kadaluwarsa,
    nama_vendor,
    biaya,
    catatan
  } = req.body;

  if (!id_apar || !tanggal || !tanggal_kadaluwarsa || !nama_vendor || !biaya) {
    return res.status(400).json({
      message: 'Data wajib diisi: id_apar, tanggal, tanggal_kadaluwarsa, nama_vendor, biaya'
    });
  }

  const data = {
    id_apar,
    tanggal,
    tanggal_kadaluwarsa,
    nama_vendor,
    biaya,
    catatan
  };

  PengisianUlang.update(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah data pengisian ulang',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data pengisian ulang tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah data pengisian ulang',
      data: {
        id_return: id,
        ...data
      }
    });
  });
};

exports.patchPengisianUlang = (req, res) => {
  const { id } = req.params;
  const data = req.body;

  PengisianUlang.updatePartial(id, data, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengubah sebagian data pengisian ulang',
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
        message: 'Data pengisian ulang tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengubah sebagian data pengisian ulang',
      data: {
        id_return: id,
        ...data
      }
    });
  });
};

exports.deletePengisianUlang = (req, res) => {
  const { id } = req.params;

  PengisianUlang.delete(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus data pengisian ulang',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data pengisian ulang tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil menghapus data pengisian ulang'
    });
  });
};
