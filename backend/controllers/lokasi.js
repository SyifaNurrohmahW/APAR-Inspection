const Lokasi = require('../models/lokasi');

exports.getAllLokasi = (req, res) => {
    Lokasi.getAll((err, results) => {
        if (err) {  
            return res.status(500).json({
                message: 'Gagal mengambil data lokasi',
                error: err
            });
        }   
        res.json({
            message: 'Berhasil mengambil data lokasi',
            data: results
        });
    });
};

exports.createLokasi = (req, res) => {
    const data = req.body;
    Lokasi.create(data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal menambahkan data lokasi',
                error: err
            });
        }
        res.status(201).json({
            message: 'Berhasil menambahkan data lokasi',
            data: result
        });
    });
}

exports.getLokasiById = (req, res) => {
    const { id } = req.params;
    Lokasi.getById(id, (err, results) => {
        if (err) {  
            return res.status(500).json({
                message: 'Gagal mengambil data lokasi',
                error: err
            });
        }  

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Data lokasi tidak ditemukan'
            });
        }

        res.status(200).json({
            message : "Berhasil mengambil data lokasi berdasarkan Id",
            data : results[0]
        });
    });
};

exports.updateLokasi = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    Lokasi.update(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({   
                message: 'Gagal memperbarui data lokasi',
                error: err
            });
        }
        res.json({
            message: 'Berhasil memperbarui data lokasi',
            data: result
        });
    }
);
}

exports.patchLokasi = (req, res) => {
    const { id } = req.params;
    const data = req.body;

    Lokasi.updatePartial(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal memperbarui sebagian data lokasi',
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
                message: 'Data lokasi tidak ditemukan'
            });
        }

        res.json({
            message: 'Berhasil memperbarui sebagian data lokasi',
            data: result
        });
    });
}

exports.deleteLokasi = (req, res) => {
    const { id } = req.params;
    Lokasi.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal menghapus data lokasi',
                error: err
            });
        }
        res.json({
            message: 'Berhasil menghapus data lokasi',
            data: result
        });

    });
};


