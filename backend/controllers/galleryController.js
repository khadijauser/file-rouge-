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
    const galleryItems = await Gallery.find({ isPublic: true })
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 });
    res.json({ galleryItems });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    const { title, description, treatmentType, isPublic, beforeImage, afterImage } = req.body;
    
    const isDataUrl = (val) => typeof val === 'string' && val.startsWith('data:');

    if (!isDataUrl(beforeImage) || !isDataUrl(afterImage)) {
      return res.status(400).json({ message: 'Both before and after images are required as data URLs' });
    }
    
    const galleryItem = new Gallery({
      title,
      description,
      beforeImage,
      afterImage,
      treatmentType,
      doctor: req.user.id,
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
    const { title, description, treatmentType, isPublic, beforeImage, afterImage } = req.body;
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
      isPublic
    };
    
    const isDataUrl = (val) => typeof val === 'string' && val.startsWith('data:');
    
    if (beforeImage) {
      if (!isDataUrl(beforeImage)) {
        return res.status(400).json({ message: 'beforeImage must be a data URL' });
      }
      updates.beforeImage = beforeImage;
    }
    
    if (afterImage) {
      if (!isDataUrl(afterImage)) {
        return res.status(400).json({ message: 'afterImage must be a data URL' });
      }
      updates.afterImage = afterImage;
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
    await Gallery.findByIdAndDelete(id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addGalleryItemData = async (req, res) => {
  try {
    const { title, description, treatmentType, isPublic, beforeImage, afterImage } = req.body;
    if (!title || !treatmentType || !beforeImage || !afterImage) {
      return res.status(400).json({ message: 'title, treatmentType, beforeImage and afterImage are required' });
    }
    const isDataUrl = (val) => typeof val === 'string' && val.startsWith('data:');
    if (!isDataUrl(beforeImage) || !isDataUrl(afterImage)) {
      return res.status(400).json({ message: 'beforeImage and afterImage must be data URLs' });
    }
    const galleryItem = new Gallery({
      title,
      description,
      beforeImage,
      afterImage,
      treatmentType,
      doctor: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    await galleryItem.save();
    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate('doctor', 'name email');
    res.status(201).json({ message: 'Gallery item added successfully', galleryItem: populatedItem });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateGalleryItemData = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, treatmentType, isPublic, beforeImage, afterImage } = req.body;
    const update = { title, description, treatmentType, isPublic };
    const isDataUrl = (val) => typeof val === 'string' && val.startsWith('data:');
    if (beforeImage) {
      if (!isDataUrl(beforeImage)) return res.status(400).json({ message: 'beforeImage must be a data URL' });
      update.beforeImage = beforeImage;
    }
    if (afterImage) {
      if (!isDataUrl(afterImage)) return res.status(400).json({ message: 'afterImage must be a data URL' });
      update.afterImage = afterImage;
    }
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
    const item = await Gallery.findByIdAndUpdate(id, update, { new: true })
      .populate('doctor', 'name email');
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });
    res.json({ message: 'Gallery item updated', galleryItem: item });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};