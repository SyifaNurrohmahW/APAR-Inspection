const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const DataPengguna = {
  // Inisialisasi/memastikan kolom id_kapal ada di ms_users
  initTable: (callback) => {
    db.query("SHOW COLUMNS FROM ms_users LIKE 'id_kapal'", (err, columns) => {
      if (!err && columns.length === 0) {
        db.query("ALTER TABLE ms_users ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_users", (alterErr) => {
          if (alterErr) {
            console.error("Gagal menambahkan kolom id_kapal ke ms_users:", alterErr);
          } else {
            console.log("Kolom id_kapal berhasil ditambahkan ke ms_users.");
          }
          if (callback) callback(alterErr);
        });
      } else {
        if (callback) callback(err);
      }
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
