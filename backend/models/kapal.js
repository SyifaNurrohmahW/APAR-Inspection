const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Kapal = {
  // Inisialisasi tabel ms_kapal dan seed data default jika kosong
  initTable: (callback) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ms_kapal (
        id_kapal INT AUTO_INCREMENT PRIMARY KEY,
        nama_kapal VARCHAR(150) NOT NULL,
        kode_kapal VARCHAR(50) NOT NULL UNIQUE,
        keterangan TEXT,
        status VARCHAR(20) DEFAULT 'aktif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createTableQuery, (err, res) => {
      if (err) {
        console.error('Gagal memverifikasi/membuat tabel ms_kapal:', err);
        if (callback) callback(err);
        return;
      }

      console.log('Tabel ms_kapal terverifikasi/siap.');

      // Cek apakah tabel kosong, jika kosong buatkan data kapal default
      db.query('SELECT COUNT(*) AS count FROM ms_kapal', (countErr, results) => {
        if (!countErr && results[0].count === 0) {
          const seedQuery = `
            INSERT INTO ms_kapal (nama_kapal, kode_kapal, keterangan, status, created_at, updated_at)
            VALUES ('KM Kelud', 'KPL-001', 'Kapal Utama Default', 'aktif', NOW(), NOW())
          `;
          db.query(seedQuery, (seedErr) => {
            if (seedErr) {
              console.error('Gagal membuat data kapal default:', seedErr);
            } else {
              console.log('Data kapal default (KM Kelud - KPL-001) berhasil dibuat.');
            }
            if (callback) callback(null, res);
          });
        } else {
          if (callback) callback(null, res);
        }
      });
    });
  },

  // Ambil semua kapal
  getAll: (callback) => {
    const query = 'SELECT * FROM ms_kapal ORDER BY id_kapal DESC';
    db.query(query, callback);
  },

  // Ambil kapal berdasarkan ID
  getById: (id_kapal, callback) => {
    const query = 'SELECT * FROM ms_kapal WHERE id_kapal = ?';
    db.query(query, [id_kapal], callback);
  },

  // Tambah kapal baru
  create: (data, callback) => {
    const query = `
      INSERT INTO ms_kapal (nama_kapal, kode_kapal, keterangan, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const values = [
      data.nama_kapal,
      data.kode_kapal,
      data.keterangan || null,
      data.status || 'aktif'
    ];
    db.query(query, values, callback);
  },

  // Update data kapal
  update: (id_kapal, data, callback) => {
    const query = `
      UPDATE ms_kapal
      SET nama_kapal = ?, kode_kapal = ?, keterangan = ?, status = ?, updated_at = NOW()
      WHERE id_kapal = ?
    `;
    const values = [
      data.nama_kapal,
      data.kode_kapal,
      data.keterangan || null,
      data.status || 'aktif',
      id_kapal
    ];
    db.query(query, values, callback);
  },

  updatePartial: (id_kapal, data, callback) => {
    const update = buildPartialUpdate(
      'ms_kapal',
      'id_kapal',
      id_kapal,
      data,
      ['nama_kapal', 'kode_kapal', 'keterangan', 'status'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus data kapal
  delete: (id_kapal, callback) => {
    const query = 'DELETE FROM ms_kapal WHERE id_kapal = ?';
    db.query(query, [id_kapal], callback);
  }
};

module.exports = Kapal;
