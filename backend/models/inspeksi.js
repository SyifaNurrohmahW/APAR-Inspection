const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Inspeksi = {
  // Ambil semua data inspeksi
  getAll: (callback) => {
    const query = `
      SELECT 
       *
      FROM tr_inspeksi
      LEFT JOIN ms_apar 
        ON tr_inspeksi.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      ORDER BY tr_inspeksi.id_inspeksi DESC
    `;

    db.query(query, callback);
  },

  // Ambil inspeksi berdasarkan ID
  getById: (id_inspeksi, callback) => {
    const query = `
      SELECT 
        tr_inspeksi.id_inspeksi,
        tr_inspeksi.id_apar,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_apar.status,
        ms_lokasi.lokasi,
        tr_inspeksi.tanggal_inspeksi,
        tr_inspeksi.kondisi_tekanan,
        tr_inspeksi.hasil,
        tr_inspeksi.catatan,
        tr_inspeksi.created_at,
        tr_inspeksi.updated_at
      FROM tr_inspeksi
      LEFT JOIN ms_apar 
        ON tr_inspeksi.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      WHERE tr_inspeksi.id_inspeksi = ?
    `;

    db.query(query, [id_inspeksi], callback);
  },

  // Tambah data inspeksi
  create: (data, callback) => {
    const query = `
      INSERT INTO tr_inspeksi
      (
        id_apar,
        tanggal_inspeksi,
        kondisi_tekanan,
        hasil,
        catatan,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_apar,
      data.tanggal_inspeksi,
      data.kondisi_tekanan,
      data.hasil,
      data.catatan
    ];

    db.query(query, values, callback);
  },

  // Update data inspeksi
  update: (id_inspeksi, data, callback) => {
    const query = `
      UPDATE tr_inspeksi
      SET
        id_apar = ?,
        tanggal_inspeksi = ?,
        kondisi_tekanan = ?,
        hasil = ?,
        catatan = ?,
        updated_at = NOW()
      WHERE id_inspeksi = ?
    `;

    const values = [
      data.id_apar,
      data.tanggal_inspeksi,
      data.kondisi_tekanan,
      data.hasil,
      data.catatan,
      id_inspeksi
    ];

    db.query(query, values, callback);
  },

  updatePartial: (id_inspeksi, data, callback) => {
    const update = buildPartialUpdate(
      'tr_inspeksi',
      'id_inspeksi',
      id_inspeksi,
      data,
      ['id_apar', 'tanggal_inspeksi', 'kondisi_tekanan', 'hasil', 'catatan'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus data inspeksi
  delete: (id_inspeksi, callback) => {
    const query = `
      DELETE FROM tr_inspeksi
      WHERE id_inspeksi = ?
    `;

    db.query(query, [id_inspeksi], callback);
  }
};

module.exports = Inspeksi;
