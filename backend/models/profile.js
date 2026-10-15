const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Profile = {
  // Ambil profile berdasarkan id user
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

  // Ambil data user lengkap termasuk password, untuk validasi password lama
  getPasswordById: (id_users, callback) => {
    const query = `
      SELECT 
        id_users,
        password
      FROM ms_users
      WHERE id_users = ?
    `;

    db.query(query, [id_users], callback);
  },

  // Cek email agar tidak bentrok dengan user lain
  getByEmail: (email, callback) => {
    const query = `
      SELECT 
        id_users,
        nama,
        email
      FROM ms_users
      WHERE email = ?
    `;

    db.query(query, [email], callback);
  },

  // Update profile tanpa role dan status
  updateProfile: (id_users, data, callback) => {
    const query = `
      UPDATE ms_users
      SET
        nama = ?,
        email = ?,
        no_hp = ?,
        updated_at = NOW()
      WHERE id_users = ?
    `;

    const values = [
      data.nama,
      data.email,
      data.no_hp,
      id_users
    ];

    db.query(query, values, callback);
  },

  updateProfilePartial: (id_users, data, callback) => {
    const update = buildPartialUpdate(
      'ms_users',
      'id_users',
      id_users,
      data,
      ['nama', 'email', 'no_hp'],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Update password
  updatePassword: (id_users, hashedPassword, callback) => {
    const query = `
      UPDATE ms_users
      SET
        password = ?,
        updated_at = NOW()
      WHERE id_users = ?
    `;

    db.query(query, [hashedPassword, id_users], callback);
  }
};

module.exports = Profile;
