const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      phone
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.resetUserPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'Email and new password are required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    user.forcePasswordChange = true;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password has been reset. User will be required to change it on next login.'
    });
    
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while resetting the password',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        code: 'MISSING_CREDENTIALS',
        message: 'Email and password are required' 
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password' 
      });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'This account is inactive. Please contact support.'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password' 
      });
    }
    
    if (user.forcePasswordChange) {
      const resetToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'yoursecret',
        { expiresIn: '1h' }
      );
      
      return res.status(403).json({
        success: false,
        code: 'PASSWORD_CHANGE_REQUIRED',
        message: 'Please change your password before logging in.',
        resetToken
      });
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'yoursecret',
      { expiresIn: '7d' }
    );
    
    user.lastLogin = new Date();
    await user.save();
    
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      permissions: user.permissions || []
    };
    
    res.json({
      success: true,
      token,
      user: userData
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone'];
    const updates = Object.fromEntries(
      Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key))
    );

    delete updates.password;
    delete updates.role;

    if (updates.email) {
      const existing = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id }
      });
      if (existing) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json({ patients });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, password } = req.body;
    
    const updateData = { name, email, role, phone };
    
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};