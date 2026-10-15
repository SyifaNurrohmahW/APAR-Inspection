const Kapal = require('../models/kapal');

exports.getAllKapal = (req, res) => {
    const role = String(req.user?.role || '').trim().toLowerCase();
    const userShipId = req.user?.id_kapal;

    if (role === 'superadmin') {
        Kapal.getAll((err, results) => {
            if (err) {  
                return res.status(500).json({
                    message: 'Gagal mengambil data kapal',
                    error: err
                });
            }   
            res.json({
                message: 'Berhasil mengambil data kapal',
                data: results
            });
        });
    } else {
        if (!userShipId) {
            return res.json({
                message: 'Berhasil mengambil data kapal',
                data: []
            });
        }
        Kapal.getById(userShipId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Gagal mengambil data kapal',
                    error: err
                });
            }
            res.json({
                message: 'Berhasil mengambil data kapal',
                data: results
            });
        });
    }
};

exports.getKapalById = (req, res) => {
    const { id } = req.params;
    const role = String(req.user?.role || '').trim().toLowerCase();
    const userShipId = req.user?.id_kapal;

    if (role !== 'superadmin' && Number(id) !== Number(userShipId)) {
        return res.status(403).json({
            message: 'Anda tidak memiliki izin untuk mengakses data kapal ini'
        });
    }

    Kapal.getById(id, (err, results) => {
        if (err) {  
            return res.status(500).json({
                message: 'Gagal mengambil data kapal',
                error: err
            });
        }  

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Data kapal tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Berhasil mengambil data kapal berdasarkan Id',
            data: results[0]
        });
    });
};

exports.createKapal = (req, res) => {
    const data = req.body;
    if (!data.nama_kapal || !data.kode_kapal) {
        return res.status(400).json({
            message: 'Nama kapal dan kode kapal wajib diisi'
        });
    }

    Kapal.create(data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal menambahkan data kapal (kode kapal mungkin sudah digunakan)',
                error: err
            });
        }
        res.status(201).json({
            message: 'Berhasil menambahkan data kapal',
            data: result
        });
    });
};

exports.updateKapal = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    Kapal.update(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({   
                message: 'Gagal memperbarui data kapal',
                error: err
            });
        }
        res.json({
            message: 'Berhasil memperbarui data kapal',
            data: result
        });
    });
};

exports.patchKapal = (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Kapal.updatePartial(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal memperbarui sebagian data kapal',
                error: err
            });
        }

        if (result.noFields) {
            return res.status(400).json({
                message: 'Minimal kirim satu field valid untuk diubah'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data kapal tidak ditemukan'
            });
        }

        res.json({
            message: 'Berhasil memperbarui sebagian data kapal',
            data: result
        });
    });
};

exports.deleteKapal = (req, res) => {
    const { id } = req.params;
    Kapal.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal menghapus data kapal',
                error: err
            });
        }
        res.json({
            message: 'Berhasil menghapus data kapal',
            data: result
        });
    });
};
