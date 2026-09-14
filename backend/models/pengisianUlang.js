const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const syncAparExpiry = (id_apar, tanggal_kadaluwarsa, callback) => {
  const query = `
    UPDATE ms_apar
    SET
      tanggal = ?,
      status = CASE
        WHEN DATEDIFF(?, CURDATE()) < 0 THEN 'Kedaluwarsa'
        WHEN DATEDIFF(?, CURDATE()) <= 30 THEN 'Akan Kedaluwarsa'
        ELSE 'Baik'
      END,
      updated_at = NOW()
    WHERE id_apar = ?
  `;

  db.query(
    query,
    [tanggal_kadaluwarsa, tanggal_kadaluwarsa, tanggal_kadaluwarsa, id_apar],
    callback
  );
};

const PengisianUlang = {
  // Ambil semua data pengisian ulang
  getAll: (callback) => {
    const query = `
      SELECT *
      FROM tr_return
      LEFT JOIN ms_apar 
        ON tr_return.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      ORDER BY tr_return.id_return DESC
    `;

    db.query(query, callback);
  },

  // Ambil data pengisian ulng berdasarkan ID
  getById: (id_return, callback) => {
    const query = `
      SELECT 
        tr_return.id_return,
        tr_return.id_apar,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_lokasi.lokasi,
        tr_return.tanggal,
        tr_return.tanggal_kadaluwarsa,
        tr_return.nama_vendor,
        tr_return.biaya,
        tr_return.catatan,
        tr_return.created_at,
        tr_return.updated_at
      FROM tr_return
      LEFT JOIN ms_apar 
        ON tr_return.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      WHERE tr_return.id_return = ?
    `;

    db.query(query, [id_return], callback);
  },

  // Tambah data pengisian ulang
  create: (data, callback) => {
    const query = `
      INSERT INTO tr_return
      (
        id_apar,
        tanggal,
        tanggal_kadaluwarsa,
        nama_vendor,
        biaya,
        catatan,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_apar,
      data.tanggal,
      data.tanggal_kadaluwarsa,
      data.nama_vendor,
      data.biaya,
      data.catatan
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        return callback(err);
      }

      syncAparExpiry(data.id_apar, data.tanggal_kadaluwarsa, (syncErr) => {
        if (syncErr) {
          return callback(syncErr);
        }

        callback(null, results);
      });
    });
  },

  // Update data pengisian ulang
  update: (id_return, data, callback) => {
    const query = `
      UPDATE tr_return
      SET
        id_apar = ?,
        tanggal = ?,
        tanggal_kadaluwarsa = ?,
        nama_vendor = ?,
        biaya = ?,
        catatan = ?,
        updated_at = NOW()
      WHERE id_return = ?
    `;

    const values = [
      data.id_apar,
      data.tanggal,
      data.tanggal_kadaluwarsa,
      data.nama_vendor,
      data.biaya,
      data.catatan,
      id_return
    ];

    db.query(query, values, (err, results) => {
      if (err) {
        return callback(err);
      }

      if (results.affectedRows === 0) {
        return callback(null, results);
      }

      syncAparExpiry(data.id_apar, data.tanggal_kadaluwarsa, (syncErr) => {
        if (syncErr) {
          return callback(syncErr);
        }

        callback(null, results);
      });
    });
  },

  updatePartial: (id_return, data, callback) => {
    const update = buildPartialUpdate(
      'tr_return',
      'id_return',
      id_return,
      data,
      ['id_apar', 'tanggal', 'tanggal_kadaluwarsa', 'nama_vendor', 'biaya', 'catatan'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus data pengisian ulang
  delete: (id_return, callback) => {
    const query = `
      DELETE FROM tr_return
      WHERE id_return = ?
    `;

    db.query(query, [id_return], callback);
  }
};

module.exports = PengisianUlang;
