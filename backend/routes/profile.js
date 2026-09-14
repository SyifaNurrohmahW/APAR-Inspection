const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile');
const { verifyToken } = require('../middleware/auth');

router.get('/:id', verifyToken, profileController.getProfile);
router.put('/:id', verifyToken, profileController.updateProfile);
router.patch('/:id', verifyToken, profileController.patchProfile);
router.put('/:id/password', verifyToken, profileController.updatePassword);

module.exports = router;
