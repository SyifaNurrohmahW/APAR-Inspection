const express = require('express');
const router = express.Router();

const whatsappController = require('../controllers/whatsapp');
const { verifyToken, isSuperadmin } = require('../middleware/auth');

router.post('/start', verifyToken, isSuperadmin, whatsappController.startWhatsapp);
router.get('/status', verifyToken, isSuperadmin, whatsappController.getWhatsappStatus);
router.post('/send-test', verifyToken, isSuperadmin, whatsappController.sendTestMessage);

module.exports = router;
