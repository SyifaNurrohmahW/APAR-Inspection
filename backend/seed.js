require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/connection');

const createSuperadmin = async () => {
  const nama = 'Superadmin';
  const email = 'superadmin@apar.com';
  const password = 'superadmin123';
  const role = 'superadmin';
  const status = 'aktif';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const checkEmailQuery = `
      SELECT id_users 
      FROM ms_users 
      WHERE email = ?
    `;

    db.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error('Gagal mengecek email:', err);
        process.exit(1);
      }

      if (results.length > 0) {
        console.log('Superadmin sudah ada, tidak perlu dibuat lagi.');
        process.exit(0);
      }

      const insertQuery = `
        INSERT INTO ms_users
        (
          nama,
          email,
          password,
          role,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const values = [
        nama,
        email,
        hashedPassword,
        role,
        status
      ];

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          console.error('Gagal membuat superadmin:', err);
          process.exit(1);
        }

        console.log('Superadmin berhasil dibuat!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('ID:', result.insertId);

        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    process.exit(1);
  }
};

createSuperadmin();