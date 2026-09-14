const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const DataPengguna = {
  // Ambil semua pengguna
  getAll: (callback) => {
    const query = `
      SELECT 
        id_users,
        nama,
        email,
        no_hp,
        role,
        status,
        created_at,
        updated_at
      FROM ms_users
      ORDER BY id_users DESC
    `;

    db.query(query, callback);
  },

  // Ambil pengguna berdasarkan ID
  getById: (id_users, callback) => {
    const query = `
      SELECT 
        id_users,
        nama,
        email,
        no_hp,
        role,
        status,
        created_at,
        updated_at
      FROM ms_users
      WHERE id_users = ?
    `;

    db.query(query, [id_users], callback);
  },

  // Cek email agar tidak duplikat
  getByEmail: (email, callback) => {
    const query = `
      SELECT 
        id_users,
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
        nama,
        email,
        no_hp,
        password,
        role,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
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
        nama = ?,
        email = ?,
        no_hp = ?,
        role = ?,
        status = ?,
        updated_at = NOW()
      WHERE id_users = ?
    `;

    const values = [
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
      ['nama', 'email', 'no_hp', 'password', 'role', 'status'],
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
