const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Riwayat = {
  // Ambil semua riwayat
  getAll: (callback) => {
    const query = `
      SELECT
        tr_riwayat.id_riwayat,
        tr_riwayat.id_users,
        ms_users.nama,
        ms_users.email,
        ms_users.role,

        tr_inspeksi.id_inspeksi,
        tr_inspeksi.tanggal_inspeksi,
        tr_inspeksi.kondisi_tekanan,
        tr_inspeksi.hasil,
        tr_inspeksi.catatan,

        ms_apar.id_apar,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_lokasi.lokasi

      FROM tr_inspeksi
      LEFT JOIN tr_riwayat
        ON tr_inspeksi.id_inspeksi = tr_riwayat.id_inspeksi
      LEFT JOIN ms_users
        ON tr_riwayat.id_users = ms_users.id_users
      LEFT JOIN ms_apar
        ON tr_inspeksi.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      ORDER BY tr_inspeksi.tanggal_inspeksi DESC, tr_inspeksi.id_inspeksi DESC
    `;

    db.query(query, callback);
  },

  // Ambil riwayat berdasarkan ID
  getById: (id_riwayat, callback) => {
    const query = `
      SELECT
        tr_riwayat.id_riwayat,
        tr_riwayat.id_users,
        ms_users.nama,
        ms_users.email,
        ms_users.role,

        tr_riwayat.id_inspeksi,
        tr_inspeksi.tanggal_inspeksi,
        tr_inspeksi.kondisi_tekanan,
        tr_inspeksi.hasil,
        tr_inspeksi.catatan,

        ms_apar.id_apar,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_lokasi.lokasi

      FROM tr_riwayat
      LEFT JOIN ms_users
        ON tr_riwayat.id_users = ms_users.id_users
      LEFT JOIN tr_inspeksi
        ON tr_riwayat.id_inspeksi = tr_inspeksi.id_inspeksi
      LEFT JOIN ms_apar
        ON tr_inspeksi.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      WHERE tr_riwayat.id_riwayat = ?
    `;

    db.query(query, [id_riwayat], callback);
  },

  // Ambil riwayat berdasarkan user
  getByUserId: (id_users, callback) => {
    const query = `
      SELECT
        tr_riwayat.id_riwayat,
        tr_riwayat.id_users,
        ms_users.nama,
        ms_users.email,
        ms_users.role,

        tr_riwayat.id_inspeksi,
        tr_inspeksi.tanggal_inspeksi,
        tr_inspeksi.kondisi_tekanan,
        tr_inspeksi.hasil,
        tr_inspeksi.catatan,

        ms_apar.id_apar,
        ms_apar.kode_apar,
        ms_apar.jenis,
        ms_apar.berat,
        ms_lokasi.lokasi

      FROM tr_riwayat
      LEFT JOIN ms_users
        ON tr_riwayat.id_users = ms_users.id_users
      LEFT JOIN tr_inspeksi
        ON tr_riwayat.id_inspeksi = tr_inspeksi.id_inspeksi
      LEFT JOIN ms_apar
        ON tr_inspeksi.id_apar = ms_apar.id_apar
      LEFT JOIN ms_lokasi
        ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
      WHERE tr_riwayat.id_users = ?
      ORDER BY tr_riwayat.id_riwayat DESC
    `;

    db.query(query, [id_users], callback);
  },

  // Tambah riwayat
  create: (data, callback) => {
    db.query(
      'SELECT id_riwayat FROM tr_riwayat WHERE id_inspeksi = ? LIMIT 1',
      [data.id_inspeksi],
      (findErr, existingRows) => {
        if (findErr) {
          return callback(findErr);
        }

        if (existingRows.length > 0) {
          return callback(null, {
            insertId: existingRows[0].id_riwayat,
            affectedRows: 0,
            alreadyExists: true
          });
        }

        db.query(
          'SELECT COALESCE(MAX(id_riwayat), 0) + 1 AS next_id FROM tr_riwayat',
          (nextErr, nextRows) => {
            if (nextErr) {
              return callback(nextErr);
            }

            const id_riwayat = nextRows[0].next_id;
            const query = `
              INSERT INTO tr_riwayat
              (
                id_riwayat,
                id_users,
                id_inspeksi
              )
              VALUES (?, ?, ?)
            `;

            db.query(
              query,
              [id_riwayat, data.id_users, data.id_inspeksi],
              (insertErr, results) => {
                if (insertErr) {
                  return callback(insertErr);
                }

                callback(null, {
                  ...results,
                  insertId: id_riwayat
                });
              }
            );
          }
        );
      }
    );
  },

  // Update riwayat
  update: (id_riwayat, data, callback) => {
    const query = `
      UPDATE tr_riwayat
      SET
        id_users = ?,
        id_inspeksi = ?
      WHERE id_riwayat = ?
    `;

    const values = [
      data.id_users,
      data.id_inspeksi,
      id_riwayat
    ];

    db.query(query, values, callback);
  },

  updatePartial: (id_riwayat, data, callback) => {
    const update = buildPartialUpdate(
      'tr_riwayat',
      'id_riwayat',
      id_riwayat,
      data,
      ['id_users', 'id_inspeksi']
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  // Hapus riwayat
  delete: (id_riwayat, callback) => {
    const query = `
      DELETE FROM tr_riwayat
      WHERE id_riwayat = ?
    `;

    db.query(query, [id_riwayat], callback);
  }
};

module.exports = Riwayat;
