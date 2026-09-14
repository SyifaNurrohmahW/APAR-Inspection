const express = require('express');
const router = express.Router();

const dataPenggunaController = require('../controllers/dataPengguna');
const { verifyToken, isSuperadmin } = require('../middleware/auth');

router.get('/', verifyToken, isSuperadmin, dataPenggunaController.getAllPengguna);
router.get('/:id', verifyToken, isSuperadmin, dataPenggunaController.getPenggunaById);
router.post('/', verifyToken, isSuperadmin, dataPenggunaController.createPengguna);
router.put('/:id', verifyToken, isSuperadmin, dataPenggunaController.updatePengguna);
router.patch('/:id', verifyToken, isSuperadmin, dataPenggunaController.patchPengguna);
router.delete('/:id', verifyToken, isSuperadmin, dataPenggunaController.deletePengguna);

module.exports = router;
