const express = require('express');
const router = express.Router();

const riwayatController = require('../controllers/riwayat');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, riwayatController.getAllRiwayat);
router.get('/user/:id_users', verifyToken, isAdminOrSuperadmin, riwayatController.getRiwayatByUserId);
router.get('/:id', verifyToken, isAdminOrSuperadmin, riwayatController.getRiwayatById);
router.post('/', verifyToken, isAdminOrSuperadmin, riwayatController.createRiwayat);
router.put('/:id', verifyToken, isAdminOrSuperadmin, riwayatController.updateRiwayat);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, riwayatController.patchRiwayat);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, riwayatController.deleteRiwayat);

module.exports = router;
