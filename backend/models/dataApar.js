const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const DataApar = {
  // Inisialisasi / modifikasi kolom tabel jika diperlukan
  initTable: (callback) => {
    const query = `
      CREATE TABLE IF NOT EXISTS ms_apar (
        id_apar INT AUTO_INCREMENT PRIMARY KEY,
        id_lokasi INT NOT NULL,
        kode_apar VARCHAR(50) NOT NULL,
        jenis VARCHAR(100) NOT NULL,
        berat DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        tanggal DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(query, (err, res) => {
      if (err) {
        console.error('Gagal memverifikasi/membuat tabel ms_apar:', err);
      } else {
        console.log('Tabel ms_apar terverifikasi/siap.');
        // Pastikan kolom berat bertipe DECIMAL(10, 2) untuk mendukung desimal seperti 4.5
        db.query('ALTER TABLE ms_apar MODIFY COLUMN berat DECIMAL(10, 2)', (alterErr) => {
          if (alterErr) {
            console.error('Gagal memperbarui tipe kolom berat pada ms_apar:', alterErr);
          }
        });
        // Pastikan kolom jenis bertipe VARCHAR(100) agar mendukung variasi jenis bahan master (seperti AFFF Foam)
        db.query('ALTER TABLE ms_apar MODIFY COLUMN jenis VARCHAR(100) NOT NULL', (alterErr) => {
          if (alterErr) {
            console.error('Gagal memperbarui tipe kolom jenis pada ms_apar:', alterErr);
          }
        });
      }
      if (callback) callback(err, res);
    });
  },

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
