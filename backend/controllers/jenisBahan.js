const JenisBahan = require('../models/jenisBahan');

exports.getAllJenisBahan = (req, res) => {
  JenisBahan.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data master jenis bahan',
        error: err
      });
    }
    res.status(200).json(results);
  });
};

exports.getJenisBahanById = (req, res) => {
  const { id } = req.params;

  JenisBahan.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail jenis bahan',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data jenis bahan tidak ditemukan'
      });
    }

    res.status(200).json(results[0]);
  });
};

exports.createJenisBahan = (req, res) => {
  const { nama_bahan, deskripsi } = req.body;

  if (!nama_bahan) {
    return res.status(400).json({
      message: 'Nama bahan wajib diisi'
    });
  }

  JenisBahan.create({ nama_bahan: nama_bahan.trim(), deskripsi: deskripsi ? deskripsi.trim() : '' }, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menambahkan jenis bahan',
        error: err
      });
    }

    res.status(201).json({
      message: 'Jenis bahan berhasil ditambahkan',
      id_jenis_bahan: result.insertId
    });
  });
};

exports.updateJenisBahan = (req, res) => {
  const { id } = req.params;
  const { nama_bahan, deskripsi } = req.body;

  if (!nama_bahan) {
    return res.status(400).json({
      message: 'Nama bahan wajib diisi'
    });
  }

  JenisBahan.update(id, { nama_bahan: nama_bahan.trim(), deskripsi: deskripsi ? deskripsi.trim() : '' }, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal memperbarui jenis bahan',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data jenis bahan tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Jenis bahan berhasil diperbarui'
    });
  });
};

exports.deleteJenisBahan = (req, res) => {
  const { id } = req.params;

  JenisBahan.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus jenis bahan',
        error: err
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data jenis bahan tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Jenis bahan berhasil dihapus'
    });
  });
};
