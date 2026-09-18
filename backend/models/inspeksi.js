const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Inspeksi = {
  // Inisialisasi / modifikasi kolom tabel jika diperlukan
  initTable: (callback) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tr_inspeksi (
        id_inspeksi INT AUTO_INCREMENT PRIMARY KEY,
        id_apar INT NOT NULL,
        tanggal_inspeksi DATETIME NOT NULL,
        kondisi_tekanan VARCHAR(50) NOT NULL,
        hasil VARCHAR(50) NOT NULL,
        catatan TEXT,
        foto LONGTEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createTableQuery, (err, res) => {
      if (err) {
        console.error('Gagal memverifikasi/membuat tabel tr_inspeksi:', err);
      } else {
        console.log('Tabel tr_inspeksi terverifikasi/siap.');
        db.query("SHOW COLUMNS FROM tr_inspeksi LIKE 'foto'", (checkErr, columns) => {
          if (!checkErr && columns.length === 0) {
            db.query("ALTER TABLE tr_inspeksi ADD COLUMN foto LONGTEXT NULL AFTER catatan", (alterErr) => {
              if (alterErr) {
                console.error('Gagal menambahkan kolom foto ke tr_inspeksi:', alterErr);
              } else {
                console.log('Kolom foto berhasil ditambahkan ke tr_inspeksi.');
              }
            });
          }
        });
      }
      if (callback) callback(err, res);
    });
  },

  // Ambil semua data inspeksi
  getAll: (callback) => {
    const query = `
      SELECT 
        tr_inspeksi.*,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_apar.status AS status_apar,
        ms_lokasi.lokasi
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
        tr_inspeksi.foto,
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
        foto,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_apar,
      data.tanggal_inspeksi,
      data.kondisi_tekanan,
      data.hasil,
      data.catatan || null,
      data.foto || null
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
        foto = ?,
        updated_at = NOW()
      WHERE id_inspeksi = ?
    `;

    const values = [
      data.id_apar,
      data.tanggal_inspeksi,
      data.kondisi_tekanan,
      data.hasil,
      data.catatan || null,
      data.foto || null,
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
      ['id_apar', 'tanggal_inspeksi', 'kondisi_tekanan', 'hasil', 'catatan', 'foto'],
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
