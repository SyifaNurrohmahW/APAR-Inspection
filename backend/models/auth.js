const db = require('../config/connection');

const Auth = {
  getUserByEmail: (email, callback) => {
    const query = `
      SELECT 
        ms_users.id_users,
        ms_users.id_kapal,
        ms_users.nama,
        ms_users.email,
        ms_users.no_hp,
        ms_users.password,
        ms_users.role,
        ms_users.status,
        ms_kapal.nama_kapal,
        ms_kapal.kode_kapal
      FROM ms_users
      LEFT JOIN ms_kapal ON ms_users.id_kapal = ms_kapal.id_kapal
      WHERE ms_users.email = ?
      LIMIT 1
    `;

    db.query(query, [email], callback);
  }
};

module.exports = Auth;
