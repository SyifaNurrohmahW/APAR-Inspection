const express = require('express');
const router = express.Router();

const lokasiController = require('../controllers/lokasi');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, lokasiController.getAllLokasi);
router.get('/:id', verifyToken, isAdminOrSuperadmin, lokasiController.getLokasiById);
router.post('/', verifyToken, isAdminOrSuperadmin, lokasiController.createLokasi);
router.put('/:id', verifyToken, isAdminOrSuperadmin, lokasiController.updateLokasi);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, lokasiController.patchLokasi);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, lokasiController.deleteLokasi);

module.exports = router;
