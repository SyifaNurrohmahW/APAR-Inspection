const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcryptjs');

const checkAndSeedSuperadmin = (callback) => {
  const checkQuery = "SELECT id_users FROM ms_users WHERE email = 'superadmin@apar.com' LIMIT 1";
  db.query(checkQuery, async (err, results) => {
    if (!err && results && results.length === 0) {
      try {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        const insertQuery = `
          INSERT INTO ms_users (nama, email, password, role, status, created_at, updated_at)
          VALUES ('Superadmin', 'superadmin@apar.com', ?, 'superadmin', 'aktif', NOW(), NOW())
        `;
        db.query(insertQuery, [hashedPassword], (seedErr) => {
          if (seedErr) {
            console.error('Gagal membuat superadmin default:', seedErr);
          } else {
            console.log('Superadmin default (superadmin@apar.com / superadmin123) berhasil dibuat!');
          }
          if (callback) callback(seedErr);
        });
      } catch (hashErr) {
        if (callback) callback(hashErr);
      }
    } else {
      if (callback) callback(err);
    }
  });
};

const DataPengguna = {
  // Inisialisasi/memastikan tabel ms_users ada dan kolom id_kapal ada di ms_users
  initTable: (callback) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ms_users (
        id_users INT AUTO_INCREMENT PRIMARY KEY,
        id_kapal INT NULL DEFAULT NULL,
        nama VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        no_hp VARCHAR(30) NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'teknisi',
        status VARCHAR(20) DEFAULT 'aktif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    db.query(createTableQuery, (createErr) => {
      if (createErr) {
        console.error('Gagal memverifikasi/membuat tabel ms_users:', createErr);
        if (callback) callback(createErr);
        return;
      }
      console.log('Tabel ms_users terverifikasi/siap.');

      db.query("SHOW COLUMNS FROM ms_users LIKE 'id_kapal'", (err, columns) => {
        if (!err && columns.length === 0) {
          db.query("ALTER TABLE ms_users ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_users", (alterErr) => {
            if (alterErr) {
              console.error("Gagal menambahkan kolom id_kapal ke ms_users:", alterErr);
            } else {
              console.log("Kolom id_kapal berhasil ditambahkan ke ms_users.");
            }
            checkAndSeedSuperadmin(callback);
          });
        } else {
          checkAndSeedSuperadmin(callback);
        }
      });
    });
  },

  // Ambil semua pengguna (opsional filter id_kapal)
  getAll: (id_kapal_filter, callback) => {
    // Jika argumen pertama berupa callback
    if (typeof id_kapal_filter === 'function') {
      callback = id_kapal_filter;
      id_kapal_filter = null;
    }

    let query = `
      SELECT 
        ms_users.id_users,
        ms_users.id_kapal,
        ms_users.nama,
        ms_users.email,
        ms_users.no_hp,
        ms_users.role,
        ms_users.status,
        ms_users.created_at,
        ms_users.updated_at,
        ms_kapal.nama_kapal,
        ms_kapal.kode_kapal
      FROM ms_users
      LEFT JOIN ms_kapal ON ms_users.id_kapal = ms_kapal.id_kapal
    `;

    const values = [];
    if (id_kapal_filter) {
      query += ` WHERE ms_users.id_kapal = ?`;
      values.push(id_kapal_filter);
    }

    query += ` ORDER BY ms_users.id_users DESC`;

    db.query(query, values, callback);
  },

  // Ambil pengguna berdasarkan ID
  getById: (id_users, callback) => {
    const query = `
      SELECT 
        ms_users.id_users,
        ms_users.id_kapal,
        ms_users.nama,
        ms_users.email,
        ms_users.no_hp,
        ms_users.role,
        ms_users.status,
        ms_users.created_at,
        ms_users.updated_at,
        ms_kapal.nama_kapal,
        ms_kapal.kode_kapal
      FROM ms_users
      LEFT JOIN ms_kapal ON ms_users.id_kapal = ms_kapal.id_kapal
      WHERE ms_users.id_users = ?
    `;

    db.query(query, [id_users], callback);
  },

  // Cek email agar tidak duplikat
  getByEmail: (email, callback) => {
    const query = `
      SELECT 
        id_users,
        id_kapal,
        nama,
        email,
        no_hp,
        password,
        role,
        status
      FROM ms_users
      WHERE email = ?
    `;

    db.query(query, [email], callback);
  },

  // Tambah pengguna/admin baru
  create: (data, callback) => {
    const query = `
      INSERT INTO ms_users
      (
        id_kapal,
        nama,
        email,
        no_hp,
        password,
        role,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_kapal || null,
      data.nama,
      data.email,
      data.no_hp,
      data.password,
      data.role,
      data.status
    ];

    db.query(query, values, callback);
  },

  // Update pengguna tanpa ubah password
  update: (id_users, data, callback) => {
    const query = `
      UPDATE ms_users
      SET
        id_kapal = ?,
        nama = ?,
        email = ?,
        no_hp = ?,
        role = ?,
        status = ?,
        updated_at = NOW()
      WHERE id_users = ?
    `;

    const values = [
      data.id_kapal || null,
      data.nama,
      data.email,
      data.no_hp,
      data.role,
      data.status,
      id_users
    ];

    db.query(query, values, callback);
  },

  // Update pengguna dengan password baru
  updateWithPassword: (id_users, data, callback) => {
    const query = `
      UPDATE ms_users
      SET
        id_kapal = ?,
        nama = ?,
        email = ?,
        no_hp = ?,
        password = ?,
        role = ?,
        status = ?,
        updated_at = NOW()
      WHERE id_users = ?
    `;

    const values = [
      data.id_kapal || null,
      data.nama,
      data.email,
      data.no_hp,
      data.password,
      data.role,
      data.status,
      id_users
    ];

    db.query(query, values, callback);
  },

  updatePartial: (id_users, data, callback) => {
    const update = buildPartialUpdate(
      'ms_users',
      'id_users',
      id_users,
      data,
      ['id_kapal', 'nama', 'email', 'no_hp', 'password', 'role', 'status'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus pengguna
  delete: (id_users, callback) => {
    const query = `
      DELETE FROM ms_users
      WHERE id_users = ?
    `;

    db.query(query, [id_users], callback);
  }
};

module.exports = DataPengguna;
