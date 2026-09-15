const express = require('express');
const router = express.Router();

const whatsappController = require('../controllers/whatsapp');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');

router.post('/start', verifyToken, isAdminOrSuperadmin, whatsappController.startWhatsapp);
router.get('/status', verifyToken, isAdminOrSuperadmin, whatsappController.getWhatsappStatus);
router.post('/send-test', verifyToken, isAdminOrSuperadmin, whatsappController.sendTestMessage);

module.exports = router;
