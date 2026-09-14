const express = require('express');
const router = express.Router();

const pengisianUlangController = require('../controllers/pengisianUlang');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, pengisianUlangController.getAllPengisianUlang);
router.get('/:id', verifyToken, isAdminOrSuperadmin, pengisianUlangController.getPengisianUlangById);
router.post('/', verifyToken, isAdminOrSuperadmin, pengisianUlangController.createPengisianUlang);
router.put('/:id', verifyToken, isAdminOrSuperadmin, pengisianUlangController.updatePengisianUlang);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, pengisianUlangController.patchPengisianUlang);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, pengisianUlangController.deletePengisianUlang);

module.exports = router;
