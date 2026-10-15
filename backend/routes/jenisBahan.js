const express = require('express');
const router = express.Router();
const jenisBahanController = require('../controllers/jenisBahan');
const { verifyToken, isAdminOrSuperadmin, isSuperadmin } = require('../middleware/auth');

// Semua user login yang terdaftar dapat melihat master jenis bahan (untuk dropdown APAR dsb.)
router.get('/', verifyToken, isAdminOrSuperadmin, jenisBahanController.getAllJenisBahan);
router.get('/:id', verifyToken, isAdminOrSuperadmin, jenisBahanController.getJenisBahanById);

// Hanya Superadmin yang berhak menambah, mengedit, dan menghapus master jenis bahan
router.post('/', verifyToken, isSuperadmin, jenisBahanController.createJenisBahan);
router.put('/:id', verifyToken, isSuperadmin, jenisBahanController.updateJenisBahan);
router.delete('/:id', verifyToken, isSuperadmin, jenisBahanController.deleteJenisBahan);

module.exports = router;
