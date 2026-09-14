const db = require ('../config/connection');
const buildPartialUpdate = require('../helpers/partialUpdate');

const Lokasi = {
    // Ambil semua data lokasi
    getAll: (callback) => {
        const query = 'SELECT * FROM ms_lokasi ORDER BY id_lokasi DESC';
        db.query(query, callback);
    },

    // Ambil lokasi berdasarkan ID
    getById: (id_lokasi, callback) => {
        const query = 'SELECT * FROM ms_lokasi WHERE id_lokasi = ?';
        db.query(query, [id_lokasi], callback);
    },

    // Tambah data lokasi
    create: (data, callback) => {
        const query = 'INSERT INTO ms_lokasi (lokasi, created_at, updated_at) VALUES (?, NOW(), NOW())';
        db.query(query, [data.lokasi], callback);
    },

    // Update data lokasi
    update: (id_lokasi, data, callback) => {
        const query = 'UPDATE ms_lokasi SET lokasi = ?, updated_at = NOW() WHERE id_lokasi = ?';
        db.query(query, [data.lokasi, id_lokasi], callback);
    },

    updatePartial: (id_lokasi, data, callback) => {
        const update = buildPartialUpdate(
            'ms_lokasi',
            'id_lokasi',
            id_lokasi,
            data,
            ['lokasi'],
            { touchUpdatedAt: true }
        );

        if (!update) {
            return callback(null, { affectedRows: 0, changedRows: 0, noFields: true });
        }

        db.query(update.query, update.values, callback);
    },

    //Hapus data Lokasi
    delete: (id_lokasi, callback) => {
        const query = 'DELETE FROM ms_lokasi WHERE id_lokasi = ?';
        db.query(query, [id_lokasi], callback);
    }
};

exports = module.exports = Lokasi;
