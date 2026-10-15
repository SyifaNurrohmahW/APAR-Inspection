const express = require('express');
const router = express.Router();

const kapalController = require('../controllers/kapal');
const { verifyToken, isAdminOrSuperadmin, isSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, kapalController.getAllKapal);
router.get('/:id', verifyToken, isAdminOrSuperadmin, kapalController.getKapalById);
router.post('/', verifyToken, isSuperadmin, kapalController.createKapal);
router.put('/:id', verifyToken, isSuperadmin, kapalController.updateKapal);
router.patch('/:id', verifyToken, isSuperadmin, kapalController.patchKapal);
router.delete('/:id', verifyToken, isSuperadmin, kapalController.deleteKapal);

module.exports = router;
