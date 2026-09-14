const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const latestReturnJoin = `
  LEFT JOIN (
    SELECT tr_return.*
    FROM tr_return
    INNER JOIN (
      SELECT id_apar, MAX(tanggal_kadaluwarsa) AS tanggal_kadaluwarsa
      FROM tr_return
      GROUP BY id_apar
    ) latest_return
      ON tr_return.id_apar = latest_return.id_apar
      AND tr_return.tanggal_kadaluwarsa = latest_return.tanggal_kadaluwarsa
  ) latest_return
    ON ms_apar.id_apar = latest_return.id_apar
`;

const notificationSelect = `
  SELECT
    tr_notifikasi.id_notifikasi,
    tr_notifikasi.id_users,
    ms_users.nama,
    ms_users.email,
    ms_users.no_hp,
    ms_users.role,

    tr_notifikasi.id_riwayat,
    tr_riwayat.id_inspeksi,

    tr_inspeksi.tanggal_inspeksi,
    tr_inspeksi.kondisi_tekanan,
    tr_inspeksi.hasil,
    tr_inspeksi.catatan,

    ms_apar.id_apar,
    ms_apar.kode_apar,
    ms_apar.jenis,
    ms_apar.berat,
    ms_lokasi.lokasi,
    tr_notifikasi.tanggal_kadaluwarsa,
    CASE
      WHEN tr_notifikasi.tanggal_kadaluwarsa IS NULL THEN NULL
      ELSE DATEDIFF(tr_notifikasi.tanggal_kadaluwarsa, CURDATE())
    END AS sisa_hari,
    ms_apar.status AS status_apar,
    tr_notifikasi.jenis_notifikasi,
    tr_notifikasi.pesan,
    tr_notifikasi.tingkat,
    tr_notifikasi.dibaca,
    tr_notifikasi.dihapus,
    tr_notifikasi.wa_sent_at,
    tr_notifikasi.wa_status,
    tr_notifikasi.wa_response,
    tr_notifikasi.created_at,
    tr_notifikasi.updated_at,
    COALESCE(tr_notifikasi.created_at, tr_inspeksi.tanggal_inspeksi, tr_notifikasi.tanggal_kadaluwarsa) AS sort_date,
    tr_notifikasi.id_notifikasi AS sort_id
  FROM tr_notifikasi
  LEFT JOIN ms_users
    ON tr_notifikasi.id_users = ms_users.id_users
  LEFT JOIN tr_riwayat
    ON tr_notifikasi.id_riwayat = tr_riwayat.id_riwayat
  LEFT JOIN tr_inspeksi
    ON tr_riwayat.id_inspeksi = tr_inspeksi.id_inspeksi
  LEFT JOIN ms_apar
    ON ms_apar.id_apar = COALESCE(tr_notifikasi.id_apar, tr_inspeksi.id_apar)
  LEFT JOIN ms_lokasi
    ON ms_apar.id_lokasi = ms_lokasi.id_lokasi
`;

const Notifikasi = {
  // Ambil semua notifikasi
  getAll: (callback) => {
    const query = `
      ${notificationSelect}
      WHERE tr_notifikasi.dihapus = 0
      ORDER BY sort_date DESC, sort_id DESC
    `;

    db.query(query, callback);
  },

  // Ambil notifikasi berdasarkan ID
  getById: (id_notifikasi, callback) => {
    const query = `
      ${notificationSelect}
      WHERE tr_notifikasi.id_notifikasi = ?
        AND tr_notifikasi.dihapus = 0
    `;

    db.query(query, [id_notifikasi], callback);
  },

  // Ambil notifikasi berdasarkan user
  getByUserId: (id_users, callback) => {
    const query = `
      ${notificationSelect}
      WHERE tr_notifikasi.id_users = ?
        AND tr_notifikasi.dihapus = 0
      ORDER BY sort_date DESC, sort_id DESC
    `;

    db.query(query, [id_users], callback);
  },

  ensureExpiringForUser: (id_users, callback) => {
    const query = `
      INSERT INTO tr_notifikasi
      (
        id_users,
        id_apar,
        jenis_notifikasi,
        pesan,
        tingkat,
        tanggal_kadaluwarsa,
        dibaca,
        dihapus,
        created_at,
        updated_at
      )
      SELECT
        ?,
        ms_apar.id_apar,
        'kedaluwarsa_apar',
        CASE
          WHEN DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) < 0
            OR LOWER(ms_apar.status) = 'kedaluwarsa'
            THEN CONCAT('APAR ', COALESCE(ms_apar.kode_apar, '-'), ' sudah kedaluwarsa.')
          ELSE CONCAT('APAR ', COALESCE(ms_apar.kode_apar, '-'), ' akan kedaluwarsa dalam ', DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()), ' hari.')
        END,
        CASE
          WHEN DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) < 0
            OR LOWER(ms_apar.status) = 'kedaluwarsa'
            THEN 'danger'
          ELSE 'warning'
        END,
        COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal),
        0,
        0,
        NOW(),
        NOW()
      FROM ms_apar
      ${latestReturnJoin}
      WHERE COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal) IS NOT NULL
        AND (
          LOWER(ms_apar.status) IN ('akan kedaluwarsa', 'kedaluwarsa')
          OR DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) BETWEEN 0 AND 30
        )
        AND NOT EXISTS (
          SELECT 1
          FROM tr_notifikasi existing_notifikasi
          WHERE existing_notifikasi.id_users = ?
            AND existing_notifikasi.id_apar = ms_apar.id_apar
            AND existing_notifikasi.jenis_notifikasi = 'kedaluwarsa_apar'
            AND existing_notifikasi.tanggal_kadaluwarsa = COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal)
        )
    `;

    db.query(query, [id_users, id_users], callback);
  },

  ensureExpiringForEligibleUsers: (callback) => {
    const query = `
      INSERT INTO tr_notifikasi
      (
        id_users,
        id_apar,
        jenis_notifikasi,
        pesan,
        tingkat,
        tanggal_kadaluwarsa,
        dibaca,
        dihapus,
        created_at,
        updated_at
      )
      SELECT
        ms_users.id_users,
        ms_apar.id_apar,
        'kedaluwarsa_apar',
        CASE
          WHEN DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) < 0
            OR LOWER(ms_apar.status) = 'kedaluwarsa'
            THEN CONCAT('APAR ', COALESCE(ms_apar.kode_apar, '-'), ' sudah kedaluwarsa.')
          ELSE CONCAT('APAR ', COALESCE(ms_apar.kode_apar, '-'), ' akan kedaluwarsa dalam ', DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()), ' hari.')
        END,
        CASE
          WHEN DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) < 0
            OR LOWER(ms_apar.status) = 'kedaluwarsa'
            THEN 'danger'
          ELSE 'warning'
        END,
        COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal),
        0,
        0,
        NOW(),
        NOW()
      FROM ms_users
      CROSS JOIN ms_apar
      ${latestReturnJoin}
      WHERE LOWER(ms_users.role) IN ('admin', 'superadmin')
        AND LOWER(ms_users.status) = 'aktif'
        AND COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal) IS NOT NULL
        AND (
          LOWER(ms_apar.status) IN ('akan kedaluwarsa', 'kedaluwarsa')
          OR DATEDIFF(COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal), CURDATE()) BETWEEN 0 AND 30
        )
        AND NOT EXISTS (
          SELECT 1
          FROM tr_notifikasi existing_notifikasi
          WHERE existing_notifikasi.id_users = ms_users.id_users
            AND existing_notifikasi.id_apar = ms_apar.id_apar
            AND existing_notifikasi.jenis_notifikasi = 'kedaluwarsa_apar'
            AND existing_notifikasi.tanggal_kadaluwarsa = COALESCE(latest_return.tanggal_kadaluwarsa, ms_apar.tanggal)
        )
    `;

    db.query(query, callback);
  },

  createForEligibleUsers: (data, callback) => {
    const query = `
      INSERT INTO tr_notifikasi
      (
        id_users,
        id_riwayat,
        id_apar,
        jenis_notifikasi,
        pesan,
        tingkat,
        dibaca,
        dihapus,
        created_at,
        updated_at
      )
      SELECT
        ms_users.id_users,
        ?,
        ?,
        ?,
        ?,
        ?,
        0,
        0,
        NOW(),
        NOW()
      FROM ms_users
      WHERE LOWER(ms_users.role) IN ('admin', 'superadmin')
        AND LOWER(ms_users.status) = 'aktif'
        AND NOT EXISTS (
          SELECT 1
          FROM tr_notifikasi existing_notifikasi
          WHERE existing_notifikasi.id_users = ms_users.id_users
            AND existing_notifikasi.jenis_notifikasi = ?
            AND existing_notifikasi.id_riwayat = ?
        )
    `;

    const values = [
      data.id_riwayat || null,
      data.id_apar || null,
      data.jenis_notifikasi || 'inspeksi',
      data.pesan || null,
      data.tingkat || 'info',
      data.jenis_notifikasi || 'inspeksi',
      data.id_riwayat || null
    ];

    db.query(query, values, callback);
  },

  // Tambah notifikasi
  create: (data, callback) => {
    const query = `
      INSERT INTO tr_notifikasi
      (
        id_users,
        id_riwayat,
        id_apar,
        jenis_notifikasi,
        pesan,
        tingkat,
        dibaca,
        tanggal_kadaluwarsa,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const values = [
      data.id_users,
      data.id_riwayat || null,
      data.id_apar || null,
      data.jenis_notifikasi || 'inspeksi',
      data.pesan || null,
      data.tingkat || 'info',
      data.dibaca ? 1 : 0,
      data.tanggal_kadaluwarsa || null
    ];

    db.query(query, values, callback);
  },

  // Update notifikasi
  update: (id_notifikasi, data, callback) => {
    const query = `
      UPDATE tr_notifikasi
      SET
        id_users = ?,
        id_riwayat = ?,
        id_apar = ?,
        jenis_notifikasi = ?,
        pesan = ?,
        tingkat = ?,
        dibaca = ?,
        tanggal_kadaluwarsa = ?,
        updated_at = NOW()
      WHERE id_notifikasi = ?
    `;

    const values = [
      data.id_users,
      data.id_riwayat || null,
      data.id_apar || null,
      data.jenis_notifikasi || 'inspeksi',
      data.pesan || null,
      data.tingkat || 'info',
      data.dibaca ? 1 : 0,
      data.tanggal_kadaluwarsa || null,
      id_notifikasi
    ];

    db.query(query, values, callback);
  },

  updatePartial: (id_notifikasi, data, callback) => {
    const update = buildPartialUpdate(
      'tr_notifikasi',
      'id_notifikasi',
      id_notifikasi,
      data,
      [
        'id_users',
        'id_riwayat',
        'id_apar',
        'jenis_notifikasi',
        'pesan',
        'tingkat',
        'dibaca',
        'dihapus',
        'tanggal_kadaluwarsa'
      ],
      { touchUpdatedAt: true }
    );

    if (!update) {
      return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
    }

    db.query(update.query, update.values, callback);
  },

  markAllReadByUserId: (id_users, callback) => {
    const query = `
      UPDATE tr_notifikasi
      SET
        dibaca = 1,
        updated_at = NOW()
      WHERE id_users = ?
        AND dihapus = 0
    `;

    db.query(query, [id_users], callback);
  },

  getPendingWhatsappReminders: (callback) => {
    const query = `
      ${notificationSelect}
      WHERE tr_notifikasi.jenis_notifikasi = 'kedaluwarsa_apar'
        AND tr_notifikasi.dihapus = 0
        AND tr_notifikasi.wa_sent_at IS NULL
        AND LOWER(ms_users.role) IN ('admin', 'superadmin')
        AND LOWER(ms_users.status) = 'aktif'
        AND ms_users.no_hp IS NOT NULL
        AND TRIM(ms_users.no_hp) <> ''
      ORDER BY tr_notifikasi.id_notifikasi ASC
    `;

    db.query(query, callback);
  },

  markWhatsappResult: (id_notifikasi, status, response, callback) => {
    const query = `
      UPDATE tr_notifikasi
      SET
        wa_sent_at = NOW(),
        wa_status = ?,
        wa_response = ?,
        updated_at = NOW()
      WHERE id_notifikasi = ?
    `;

    db.query(query, [status, response, id_notifikasi], callback);
  },

  // Hapus notifikasi
  delete: (id_notifikasi, id_users, callback) => {
    const query = `
      UPDATE tr_notifikasi
      SET
        dihapus = 1,
        updated_at = NOW()
      WHERE id_notifikasi = ?
        AND id_users = ?
    `;

    db.query(query, [id_notifikasi, id_users], callback);
  }
};

module.exports = Notifikasi;
