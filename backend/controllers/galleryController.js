const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

exports.getGalleryItems = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.doctor = req.user.id;
    }
    const galleryItems = await Gallery.find(query)
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ galleryItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPublicGallery = async (req, res) => {
  try {
    console.log('Fetching public gallery items...');
    const galleryItems = await Gallery.find({ isPublic: true })
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 });
    console.log('Public gallery items found:', galleryItems.length);
    res.json({ galleryItems });
  } catch (err) {
    console.error('Error in getPublicGallery:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    const { title, description, treatmentType, patientConsent, isPublic } = req.body;
    if (!req.files || !req.files.beforeImage || !req.files.afterImage) {
      return res.status(400).json({ message: 'Both before and after images are required' });
    }
    const beforeImagePath = '/uploads/' + path.basename(req.files.beforeImage[0].path);
    const afterImagePath = '/uploads/' + path.basename(req.files.afterImage[0].path);
    const galleryItem = new Gallery({
      title,
      description,
      beforeImage: beforeImagePath,
      afterImage: afterImagePath,
      treatmentType,
      doctor: req.user.id,
      patientConsent: patientConsent || false,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    await galleryItem.save();
    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate('doctor', 'name email');
    res.status(201).json({
      message: 'Gallery item added successfully',
      galleryItem: populatedItem
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateGalleryItem = async (req, res) => {
  try {
    const { title, description, treatmentType, patientConsent, isPublic } = req.body;
    const { id } = req.params;
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    if (galleryItem.doctor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updates = {
      title,
      description,
      treatmentType,
      patientConsent,
      isPublic
    };
    if (req.files) {
      if (req.files.beforeImage) {
        updates.beforeImage = '/uploads/' + path.basename(req.files.beforeImage[0].path);
      }
      if (req.files.afterImage) {
        updates.afterImage = '/uploads/' + path.basename(req.files.afterImage[0].path);
      }
    }
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
    const updatedItem = await Gallery.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate('doctor', 'name email');
    res.json({
      message: 'Gallery item updated successfully',
      galleryItem: updatedItem
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    if (galleryItem.doctor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (galleryItem.beforeImage) {
      const beforePath = path.join(__dirname, '..', galleryItem.beforeImage);
      if (fs.existsSync(beforePath)) fs.unlinkSync(beforePath);
    }
    if (galleryItem.afterImage) {
      const afterPath = path.join(__dirname, '..', galleryItem.afterImage);
      if (fs.existsSync(afterPath)) fs.unlinkSync(afterPath);
    }
    await Gallery.findByIdAndDelete(id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};