const validateRegistration = (req, res, next) => {
  const { name, email, password, phone, role } = req.body;
  const errors = [];
  
  if (!name) errors.push('Name is required');
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  
  if (name && (name.length < 2 || name.length > 50)) {
    errors.push('Name must be between 2 and 50 characters');
  }
  
  if (password) {
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  if (phone) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s|-/g, ''))) {
      errors.push('Invalid phone number format');
    }
  }
  
  if (role && !['patient', 'doctor', 'admin'].includes(role)) {
    errors.push('Invalid role');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }
  
  next();
};

const validateAppointment = (req, res, next) => {
  const { doctor, date, time } = req.body;
  
  if (!doctor || !date || !time) {
    return res.status(400).json({ message: 'Doctor, date, and time are required' });
  }
  
  const appointmentDate = new Date(date);
  if (isNaN(appointmentDate.getTime())) {
    return res.status(400).json({ message: 'Invalid date format' });
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (appointmentDate < today) {
    return res.status(400).json({ message: 'Appointment date must be today or in the future' });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateAppointment
};