const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Auth = require('../models/auth');

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email dan password wajib diisi'
    });
  }

  Auth.getUserByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal login',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: 'Email atau password salah'
      });
    }

    const user = results[0];
    const normalizedStatus = String(user.status || '').trim().toLowerCase();
    const normalizedRole = String(user.role || 'teknisi').trim().toLowerCase();

    if (normalizedStatus !== 'aktif') {
      return res.status(403).json({
        message: 'Akun tidak aktif'
      });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({
          message: 'Email atau password salah'
        });
      }

      const token = jwt.sign(
        {
          id_users: user.id_users,
          nama: user.nama,
          email: user.email,
          role: normalizedRole
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        }
      );

      res.status(200).json({
        message: 'Login berhasil',
        token,
        user: {
          id_users: user.id_users,
          nama: user.nama,
          email: user.email,
          no_hp: user.no_hp,
          role: normalizedRole,
          status: normalizedStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        message: 'Terjadi kesalahan saat login',
        error
      });
    }
  });
};

exports.register = (req, res) => {
  const { nama, email, password, konfirmasi_password, konfirmasiPassword, no_hp } = req.body;
  const confirmPass = konfirmasi_password || konfirmasiPassword;

  if (!nama || !email || !password || !confirmPass || !no_hp) {
    return res.status(400).json({
      message: 'Semua bidang form (nama, email, no_hp, password, konfirmasi password) wajib diisi'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password minimal 6 karakter'
    });
  }

  if (password !== confirmPass) {
    return res.status(400).json({
      message: 'Password dan konfirmasi password tidak cocok'
    });
  }

  const DataPengguna = require('../models/dataPengguna');

  DataPengguna.getByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengecek email',
        error: err
      });
    }

    if (results && results.length > 0) {
      return res.status(400).json({
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      DataPengguna.create(
        {
          nama: nama.trim(),
          email: email.trim().toLowerCase(),
          no_hp: no_hp.trim(),
          password: hashedPassword,
          role: 'teknisi',
          status: 'aktif'
        },
        (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({
              message: 'Gagal mendaftarkan pengguna baru',
              error: insertErr
            });
          }

          res.status(201).json({
            message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
            userId: result.insertId
          });
        }
      );
    } catch (hashErr) {
      res.status(500).json({
        message: 'Terjadi kesalahan saat memproses password',
        error: hashErr
      });
    }
  });
};
