const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const JenisBahan = {
  initTable: (callback) => {
    const query = `
      CREATE TABLE IF NOT EXISTS ms_jenis_bahan (
        id_jenis_bahan INT AUTO_INCREMENT PRIMARY KEY,
        nama_bahan VARCHAR(100) NOT NULL,
        deskripsi TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(query, (err, res) => {
      if (err) {
        console.error('Gagal membuat tabel ms_jenis_bahan:', err);
      } else {
        console.log('Tabel ms_jenis_bahan terverifikasi/siap.');
      }
      if (callback) callback(err, res);
    });
  },

  getAll: (callback) => {
    const query = `
      SELECT 
        id_jenis_bahan,
        nama_bahan,
        deskripsi,
        created_at,
        updated_at
      FROM ms_jenis_bahan
      ORDER BY id_jenis_bahan DESC
    `;
    db.query(query, callback);
  },

  getById: (id_jenis_bahan, callback) => {
    const query = `
      SELECT 
        id_jenis_bahan,
        nama_bahan,
        deskripsi,
        created_at,
        updated_at
      FROM ms_jenis_bahan
      WHERE id_jenis_bahan = ?
    `;
    db.query(query, [id_jenis_bahan], callback);
  },

  create: (data, callback) => {
    const query = `
      INSERT INTO ms_jenis_bahan (nama_bahan, deskripsi, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
    `;
    db.query(query, [data.nama_bahan, data.deskripsi || null], callback);
  },

  update: (id_jenis_bahan, data, callback) => {
    const query = `
      UPDATE ms_jenis_bahan
      SET nama_bahan = ?, deskripsi = ?, updated_at = NOW()
      WHERE id_jenis_bahan = ?
    `;
    db.query(query, [data.nama_bahan, data.deskripsi || null, id_jenis_bahan], callback);
  },

  delete: (id_jenis_bahan, callback) => {
    const query = `
      DELETE FROM ms_jenis_bahan
      WHERE id_jenis_bahan = ?
    `;
    db.query(query, [id_jenis_bahan], callback);
  }
};

module.exports = JenisBahan;
