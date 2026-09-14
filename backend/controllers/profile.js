const bcrypt = require('bcryptjs');
const Profile = require('../models/profile');

exports.getProfile = (req, res) => {
  const { id } = req.params;

  Profile.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data profile',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Profile tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data profile',
      data: results[0]
    });
  });
};

exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const { nama, email, no_hp } = req.body;

  if (!nama || !email) {
    return res.status(400).json({
      message: 'Nama dan email wajib diisi'
    });
  }

  Profile.getByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengecek email',
        error: err
      });
    }

    const emailDipakaiUserLain = results.length > 0 && results[0].id_users != id;

    if (emailDipakaiUserLain) {
      return res.status(400).json({
        message: 'Email sudah digunakan oleh pengguna lain'
      });
    }

    const data = {
      nama,
      email,
      no_hp: no_hp || null
    };

    Profile.updateProfile(id, data, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengubah profile',
          error: err
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: 'Profile tidak ditemukan'
        });
      }

      res.status(200).json({
        message: 'Berhasil mengubah profile',
        data: {
          id_users: id,
          nama,
          email,
          no_hp: no_hp || null
        }
      });
    });
  });
};

exports.patchProfile = (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  const hasValidField = ['nama', 'email', 'no_hp'].some((field) => Object.prototype.hasOwnProperty.call(data, field));

  if (!hasValidField) {
    return res.status(400).json({
      message: 'Minimal kirim nama, email, atau nomor HP untuk diubah'
    });
  }

  const updateData = () => {
    Profile.updateProfilePartial(id, data, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengubah sebagian profile',
          error: err
        });
      }

      if (results.noFields) {
        return res.status(400).json({
          message: 'Minimal kirim nama, email, atau nomor HP untuk diubah'
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: 'Profile tidak ditemukan'
        });
      }

      res.status(200).json({
        message: 'Berhasil mengubah sebagian profile',
        data: {
          id_users: id,
          ...data
        }
      });
    });
  };

  if (data.email) {
    return Profile.getByEmail(data.email, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Gagal mengecek email',
          error: err
        });
      }

      const emailDipakaiUserLain = results.length > 0 && results[0].id_users != id;

      if (emailDipakaiUserLain) {
        return res.status(400).json({
          message: 'Email sudah digunakan oleh pengguna lain'
        });
      }

      updateData();
    });
  }

  updateData();
};

exports.updatePassword = (req, res) => {
  const { id } = req.params;
  const {
    password_lama,
    password_baru,
    konfirmasi_password
  } = req.body;

  if (!password_lama || !password_baru || !konfirmasi_password) {
    return res.status(400).json({
      message: 'Password lama, password baru, dan konfirmasi password wajib diisi'
    });
  }

  if (password_baru !== konfirmasi_password) {
    return res.status(400).json({
      message: 'Konfirmasi password tidak sesuai'
    });
  }

  if (password_baru.length < 6) {
    return res.status(400).json({
      message: 'Password baru minimal 6 karakter'
    });
  }

  Profile.getPasswordById(id, async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data password',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Profile tidak ditemukan'
      });
    }

    try {
      const user = results[0];

      const passwordSesuai = await bcrypt.compare(password_lama, user.password);

      if (!passwordSesuai) {
        return res.status(400).json({
          message: 'Password lama salah'
        });
      }

      const hashedPassword = await bcrypt.hash(password_baru, 10);

      Profile.updatePassword(id, hashedPassword, (err) => {
        if (err) {
          return res.status(500).json({
            message: 'Gagal mengubah password',
            error: err
          });
        }

        res.status(200).json({
          message: 'Berhasil mengubah password'
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Terjadi kesalahan saat mengubah password',
        error
      });
    }
  });
};
