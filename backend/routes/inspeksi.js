const express = require('express');
const router = express.Router();

const inspeksiController = require('../controllers/inspeksi');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, inspeksiController.getAllInspeksi);
router.get('/:id', verifyToken, isAdminOrSuperadmin, inspeksiController.getInspeksiById);
router.post('/', verifyToken, isAdminOrSuperadmin, inspeksiController.createInspeksi);
router.put('/:id', verifyToken, isAdminOrSuperadmin, inspeksiController.updateInspeksi);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, inspeksiController.patchInspeksi);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, inspeksiController.deleteInspeksi);

module.exports = router;
