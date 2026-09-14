const express = require('express');
const router = express.Router();

const dataAparController = require('../controllers/dataApar');
const { verifyToken, isAdminOrSuperadmin } = require('../middleware/auth');


router.get('/', verifyToken, isAdminOrSuperadmin, dataAparController.getAllApar);
router.get('/:id', verifyToken, isAdminOrSuperadmin, dataAparController.getAparById);
router.post('/', verifyToken, isAdminOrSuperadmin, dataAparController.createApar);
router.put('/:id', verifyToken, isAdminOrSuperadmin, dataAparController.updateApar);
router.patch('/:id', verifyToken, isAdminOrSuperadmin, dataAparController.patchApar);
router.delete('/:id', verifyToken, isAdminOrSuperadmin, dataAparController.deleteApar);

module.exports = router;
