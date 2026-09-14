const express = require('express');
const router = express.Router();

const notifikasiController = require('../controllers/notifikasi');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isAdminOrSuperadmin, notifikasiController.getAllNotifikasi);
router.get('/user/:id_users', verifyToken, isAdminOrSuperadmin, notifikasiController.getNotifikasiByUserId);
router.patch('/read-all', verifyToken, isAdminOrSuperadmin, notifikasiController.markAllRead);
router.post('/send-wa-reminders', verifyToken, isAdminOrSuperadmin, notifikasiController.syncWhatsappReminders);
router.get('/:id', verifyToken, isAdminOrSuperadmin, notifikasiController.getNotifikasiById);
router.post('/', verifyToken, isAdminOrSuperadmin, notifikasiController.createNotifikasi);
router.put('/:id', verifyToken, isAdminOrSuperadmin, notifikasiController.updateNotifikasi);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, notifikasiController.patchNotifikasi);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, notifikasiController.deleteNotifikasi);

module.exports = router;
