const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadGalleryImages } = require('../middleware/upload');

router.get('/public', galleryController.getPublicGallery);

router.get('/', auth, galleryController.getGalleryItems);
router.post('/', auth, role('doctor', 'admin'), uploadGalleryImages, galleryController.addGalleryItem);
router.put('/:id', auth, role('doctor', 'admin'), uploadGalleryImages, galleryController.updateGalleryItem);
router.delete('/:id', auth, role('doctor', 'admin'), galleryController.deleteGalleryItem);

module.exports = router; 