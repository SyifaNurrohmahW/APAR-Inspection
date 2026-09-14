const db = require('../config/connection');

const Auth = {
  getUserByEmail: (email, callback) => {
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
      LIMIT 1
    `;

    db.query(query, [email], callback);
  }
};

module.exports = Auth;
