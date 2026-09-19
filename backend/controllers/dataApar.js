const DataApar = require('../models/dataApar');


exports.getAllApar = (req, res) => {
  DataApar.getAll((err, results) => {
    if (err) {
      return res.status(500).json({
        message: 'Gagal mengambil data APAR',
        error: err
      });
    }

    res.json({
      message: 'Berhasil mengambil data APAR',
      data: results
    });
  });
};

exports.createApar = (req, res) => {
    const data = req.body;

    DataApar.create(data, (err, result) => {
        if (err) {
            let errorMsg = 'Gagal menambahkan data APAR';
            if (err.code === 'ER_DUP_ENTRY') {
                errorMsg = `Kode APAR "${data.kode_apar}" sudah terdaftar dalam sistem. Gunakan kode lain.`;
                return res.status(400).json({ message: errorMsg, error: err });
            }
            if (err.sqlMessage) {
                errorMsg = `Gagal menambahkan data APAR: ${err.sqlMessage}`;
            }
            return res.status(500).json({
                message: errorMsg,
                error: err
            });
        }

        res.status(201).json({
            message: 'Berhasil menambahkan data APAR',
            data: result
        });
    });
};

exports.getAparById = (req, res) => {
    const { id } = req.params;

    DataApar.getById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal mengambil data APAR',
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: 'Data APAR tidak ditemukan'
            });
        }

        res.json({
            message: 'Berhasil mengambil data APAR',
            data: results[0]
        });
    });
};

exports.updateApar = (req, res) => {
    const { id } = req.params;
    const data = req.body;

    DataApar.update(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal memperbarui data APAR',
                error: err
            }); 
        }

        res.json({
            message: 'Berhasil memperbarui data APAR',
            data: result
        });
    });
};

exports.patchApar = (req, res) => {
    const { id } = req.params;
    const data = req.body;

    DataApar.updatePartial(id, data, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: 'Gagal memperbarui sebagian data APAR',
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
                message: 'Data APAR tidak ditemukan'
            });
        }

        res.json({
            message: 'Berhasil memperbarui sebagian data APAR',
            data: result
        });
    });
};

exports.deleteApar = (req, res) => {
    const { id } = req.params;
    DataApar.delete(id, (err, result) => {
        if (err) {
            return res.status(500).json({   
                message: 'Gagal menghapus data APAR',
                error: err
            });
        }   
        res.json({
            message: 'Berhasil menghapus data APAR',
            data: result
        });
    })

};
