const express = require('express');
const router = express.Router();
const jenisBahanController = require('../controllers/jenisBahan');

router.get('/', jenisBahanController.getAllJenisBahan);
router.get('/:id', jenisBahanController.getJenisBahanById);
router.post('/', jenisBahanController.createJenisBahan);
router.put('/:id', jenisBahanController.updateJenisBahan);
router.delete('/:id', jenisBahanController.deleteJenisBahan);

module.exports = router;
