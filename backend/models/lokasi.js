const db = require('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Lokasi = {
    // Inisialisasi tabel / kolom id_kapal di ms_lokasi
    initTable: (callback) => {
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS ms_lokasi (
            id_lokasi INT AUTO_INCREMENT PRIMARY KEY,
            id_kapal INT NULL DEFAULT NULL,
            lokasi VARCHAR(150) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;

        db.query(createTableQuery, (err, res) => {
            if (err) {
                console.error('Gagal memverifikasi/membuat tabel ms_lokasi:', err);
                if (callback) callback(err);
                return;
            }

            db.query("SHOW COLUMNS FROM ms_lokasi LIKE 'id_kapal'", (checkErr, columns) => {
                if (!checkErr && columns.length === 0) {
                    db.query("ALTER TABLE ms_lokasi ADD COLUMN id_kapal INT NULL DEFAULT NULL AFTER id_lokasi", (alterErr) => {
                        if (alterErr) {
                            console.error('Gagal menambahkan kolom id_kapal ke ms_lokasi:', alterErr);
                        } else {
                            console.log('Kolom id_kapal berhasil ditambahkan ke ms_lokasi.');
                        }
                        if (callback) callback(alterErr, res);
                    });
                } else {
                    if (callback) callback(null, res);
                }
            });
        });
    },

    // Ambil semua data lokasi (dengan opsional filter id_kapal)
    getAll: (id_kapal_filter, callback) => {
        if (typeof id_kapal_filter === 'function') {
            callback = id_kapal_filter;
            id_kapal_filter = null;
        }

        let query = `
          SELECT 
            ms_lokasi.*,
            ms_kapal.nama_kapal,
            ms_kapal.kode_kapal
          FROM ms_lokasi
          LEFT JOIN ms_kapal ON ms_lokasi.id_kapal = ms_kapal.id_kapal
        `;

        const values = [];
        if (id_kapal_filter) {
            query += ` WHERE ms_lokasi.id_kapal = ?`;
            values.push(id_kapal_filter);
        }

        query += ` ORDER BY ms_lokasi.id_lokasi DESC`;

        db.query(query, values, callback);
    },

    // Ambil lokasi berdasarkan ID
    getById: (id_lokasi, callback) => {
        const query = `
          SELECT 
            ms_lokasi.*,
            ms_kapal.nama_kapal,
            ms_kapal.kode_kapal
          FROM ms_lokasi
          LEFT JOIN ms_kapal ON ms_lokasi.id_kapal = ms_kapal.id_kapal
          WHERE ms_lokasi.id_lokasi = ?
        `;
        db.query(query, [id_lokasi], callback);
    },

    // Tambah data lokasi
    create: (data, callback) => {
        const query = 'INSERT INTO ms_lokasi (id_kapal, lokasi, created_at, updated_at) VALUES (?, ?, NOW(), NOW())';
        db.query(query, [data.id_kapal || null, data.lokasi], callback);
    },

    // Update data lokasi
    update: (id_lokasi, data, callback) => {
        const query = 'UPDATE ms_lokasi SET id_kapal = ?, lokasi = ?, updated_at = NOW() WHERE id_lokasi = ?';
        db.query(query, [data.id_kapal || null, data.lokasi, id_lokasi], callback);
    },

    updatePartial: (id_lokasi, data, callback) => {
        const update = buildPartialUpdate(
            'ms_lokasi',
            'id_lokasi',
            id_lokasi,
            data,
            ['id_kapal', 'lokasi'],
            { touchUpdatedAt: true }
        );

        if (!update) {
            return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
        }

        db.query(update.query, update.values, callback);
    },

    // Hapus data Lokasi
    delete: (id_lokasi, callback) => {
        const query = 'DELETE FROM ms_lokasi WHERE id_lokasi = ?';
        db.query(query, [id_lokasi], callback);
    }
};

module.exports = Lokasi;
