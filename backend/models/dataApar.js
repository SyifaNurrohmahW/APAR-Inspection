const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const DataApar = {
  // Ambil semua data APAR
  getAll: (callback) => {
    const query = `
      SELECT *
      FROM ms_apar
      LEFT JOIN ms_lokasi 
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      ORDER BY ms_apar.id_apar DESC
    `;

    db.query(query, callback);
  },

  // Ambil APAR berdasarkan ID
  getById: (id_apar, callback) => {
    const query = `
      SELECT 
        *
      FROM ms_apar
      LEFT JOIN ms_lokasi 
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      WHERE ms_apar.id_apar = ?
    `;

    db.query(query, [id_apar], callback);
  },

  // Tambah data APAR
  create: (data, callback) => {
    const query = `
      INSERT INTO ms_apar 
      (
        id_lokasi,
        kode_apar,
        jenis,
        berat,
        status,
        tanggal,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_lokasi,
      data.kode_apar,
      data.jenis,
      data.berat,
      data.status,
      data.tanggal
    ];

    db.query(query, values, callback);
  },

  // Update data APAR
  update: (id_apar, data, callback) => {
    const query = `
      UPDATE ms_apar
      SET
        id_lokasi = ?,
        kode_apar = ?,
        jenis = ?,
        berat = ?,
        status = ?,
        tanggal = ?,
        updated_at = NOW()
      WHERE id_apar = ?
    `;

    const values = [
      data.id_lokasi,
      data.kode_apar,
      data.jenis,
      data.berat,
      data.status,
      data.tanggal,
      id_apar
    ];

    db.query(query, values, callback);
  },

  updatePartial: (id_apar, data, callback) => {
    const update = buildPartialUpdate(
      'ms_apar',
      'id_apar',
      id_apar,
      data,
      ['id_lokasi', 'kode_apar', 'jenis', 'berat', 'status', 'tanggal'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus data APAR
  delete: (id_apar, callback) => {
    const query = `
      DELETE FROM ms_apar
      WHERE id_apar = ?
    `;

    db.query(query, [id_apar], callback);
  }
};

module.exports = DataApar;
