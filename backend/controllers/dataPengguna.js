const bcrypt = require('bcryptjs');
const DataPengguna = require('../models/dataPengguna');

const normalizeRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (normalizedRole === 'superadmin') {
    return 'superadmin';
  }

  if (normalizedRole === 'admin') {
    return 'admin';
  }

  if (normalizedRole === 'teknisi') {
    return 'teknisi';
  }

  return '';
};

const normalizeStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (normalizedStatus === 'aktif') {
    return 'Aktif';
  }

  if (normalizedStatus === 'nonaktif') {
    return 'Nonaktif';
  }

  return '';
};

exports.getAllPengguna = (req, res) => {
  DataPengguna.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data pengguna',
        error: err
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data pengguna',
      data: results
    });
  });
};

exports.getPenggunaById = (req, res) => {
  const { id } = req.params;

  DataPengguna.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil detail pengguna',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Data pengguna tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil detail pengguna',
      data: results[0]
    });
  });
};

exports.createPengguna = (req, res) => {
  const {
    nama,
    email,
    no_hp,
    password,
    role,
    status
  } = req.body;

  if (!nama || !email || !password || !role || !status) {
    return res.status(400).json({
      message: 'Data wajib diisi: nama, email, password, role, dan status'
    });
  }

  const normalizedRole = normalizeRole(role);
  const normalizedStatus = normalizeStatus(status);

  if (!normalizedRole) {
    return res.status(400).json({
      message: 'Role hanya boleh superadmin, admin, atau teknisi'
    });
  }

  if (!normalizedStatus) {
    return res.status(400).json({
      message: 'Status hanya boleh aktif atau nonaktif'
    });
  }

  DataPengguna.getByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengecek email',
        error: err
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: 'Email sudah digunakan'
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const data = {
        nama,
        email,
        no_hp: no_hp || null,
        password: hashedPassword,
        role: normalizedRole,
        status: normalizedStatus
      };

      DataPengguna.create(data, (err, results) => {
        if (err) {
          return res.status(500).json({
            message: 'Gagal menambahkan data pengguna',
            error: err
          });
        }

        res.status(201).json({
          message: 'Berhasil menambahkan data pengguna',
          data: {
            id_users: results.insertId,
            nama,
            email,
            no_hp: no_hp || null,
            role: normalizedRole,
            status: normalizedStatus
          }
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Gagal mengenkripsi password',
        error
      });
    }
  });
};

exports.updatePengguna = (req, res) => {
  const { id } = req.params;

  const {
    nama,
    email,
    no_hp,
    password,
    role,
    status
  } = req.body;

  if (!nama || !email || !role || !status) {
    return res.status(400).json({
      message: 'Data wajib diisi: nama, email, role, dan status'
    });
  }

  const normalizedRole = normalizeRole(role);
  const normalizedStatus = normalizeStatus(status);

  if (!normalizedRole) {
    return res.status(400).json({
      message: 'Role hanya boleh superadmin, admin, atau teknisi'
    });
  }

  if (!normalizedStatus) {
    return res.status(400).json({
      message: 'Status hanya boleh aktif atau nonaktif'
    });
  }

  DataPengguna.getByEmail(email, async (err, results) => {
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

    try {
      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
          nama,
          email,
          no_hp: no_hp || null,
          password: hashedPassword,
          role: normalizedRole,
          status: normalizedStatus
        };

        DataPengguna.updateWithPassword(id, data, (err, results) => {
          if (err) {
            return res.status(500).json({
              message: 'Gagal mengubah data pengguna',
              error: err
            });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({
              message: 'Data pengguna tidak ditemukan'
            });
          }

          res.status(200).json({
            message: 'Berhasil mengubah data pengguna',
            data: {
              id_users: id,
              nama,
              email,
              no_hp: no_hp || null,
              role: normalizedRole,
              status: normalizedStatus
            }
          });
        });
      } else {
        const data = {
          nama,
          email,
          no_hp: no_hp || null,
          role: normalizedRole,
          status: normalizedStatus
        };

        DataPengguna.update(id, data, (err, results) => {
          if (err) {
            return res.status(500).json({
              message: 'Gagal mengubah data pengguna',
              error: err
            });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({
              message: 'Data pengguna tidak ditemukan'
            });
          }

          res.status(200).json({
            message: 'Berhasil mengubah data pengguna',
            data: {
              id_users: id,
              nama,
              email,
              no_hp: no_hp || null,
              role: normalizedRole,
              status: normalizedStatus
            }
          });
        });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Gagal mengenkripsi password',
        error
      });
    }
  });
};

exports.patchPengguna = (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };
  const allowedFields = ['nama', 'email', 'no_hp', 'password', 'role', 'status'];
  const hasValidField = allowedFields.some((field) => Object.prototype.hasOwnProperty.call(data, field));

  if (!hasValidField) {
    return res.status(400).json({
      message: 'Minimal kirim satu field valid untuk diubah'
    });
  }

  if (data.role) {
    data.role = normalizeRole(data.role);

    if (!data.role) {
      return res.status(400).json({
        message: 'Role hanya boleh superadmin atau admin'
      });
    }
  }

  if (data.status) {
    data.status = normalizeStatus(data.status);

    if (!data.status) {
      return res.status(400).json({
        message: 'Status hanya boleh aktif atau nonaktif'
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(data, 'password') && (!data.password || data.password.trim() === '')) {
    return res.status(400).json({
      message: 'Password tidak boleh kosong'
    });
  }

  const updateData = async () => {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      DataPengguna.updatePartial(id, data, (err, results) => {
        if (err) {
          return res.status(500).json({
            message: 'Gagal mengubah sebagian data pengguna',
            error: err
          });
        }

        if (results.noFields) {
          return res.status(400).json({
            message: 'Minimal kirim satu field valid untuk diubah'
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            message: 'Data pengguna tidak ditemukan'
          });
        }

        res.status(200).json({
          message: 'Berhasil mengubah sebagian data pengguna',
          data: {
            id_users: id,
            ...data,
            password: undefined
          }
        });
      });
    } catch (error) {
      res.status(500).json({
        message: 'Gagal mengenkripsi password',
        error
      });
    }
  };

  if (data.email) {
    return DataPengguna.getByEmail(data.email, (err, results) => {
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

exports.deletePengguna = (req, res) => {
  const { id } = req.params;

  DataPengguna.delete(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal menghapus data pengguna',
        error: err
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Data pengguna tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil menghapus data pengguna'
    });
  });
};
