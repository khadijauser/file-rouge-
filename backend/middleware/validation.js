const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
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