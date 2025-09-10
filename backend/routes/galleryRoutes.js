const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
router.get('/public', galleryController.getPublicGallery);

router.get('/', auth, galleryController.getGalleryItems);
router.post('/', auth, role('doctor', 'admin'), galleryController.addGalleryItem);
router.put('/:id', auth, role('doctor', 'admin'), galleryController.updateGalleryItem);
router.delete('/:id', auth, role('doctor', 'admin'), galleryController.deleteGalleryItem);

router.post('/data', auth, role('doctor', 'admin'), galleryController.addGalleryItemData);
router.put('/:id/data', auth, role('doctor', 'admin'), galleryController.updateGalleryItemData);

router.get('/:id/before', async (req, res) => {
  try {
    const item = await require('../models/Gallery').findById(req.params.id).lean();
    if (!item || !item.beforeImage) return res.status(404).send('Not found');
    if (typeof item.beforeImage === 'string' && item.beforeImage.startsWith('data:')) {
      const match = item.beforeImage.match(/^data:(.*?);base64,(.*)$/);
      if (!match) return res.status(400).send('Invalid data URL');
      res.set('Content-Type', match[1]);
      return res.send(Buffer.from(match[2], 'base64'));
    }
    return res.redirect(item.beforeImage);
  } catch (e) {
    return res.status(500).send('Server error');
  }
});

router.get('/:id/after', async (req, res) => {
  try {
    const item = await require('../models/Gallery').findById(req.params.id).lean();
    if (!item || !item.afterImage) return res.status(404).send('Not found');
    if (typeof item.afterImage === 'string' && item.afterImage.startsWith('data:')) {
      const match = item.afterImage.match(/^data:(.*?);base64,(.*)$/);
      if (!match) return res.status(400).send('Invalid data URL');
      res.set('Content-Type', match[1]);
      return res.send(Buffer.from(match[2], 'base64'));
    }
    return res.redirect(item.afterImage);
  } catch (e) {
    return res.status(500).send('Server error');
  }
});

module.exports = router;