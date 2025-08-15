require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));

app.get('/api/debug/appointments', async (req, res) => {
  try {
    const Appointment = require('./models/Appointment');
    const allAppointments = await Appointment.find().populate('patient doctor', 'name email role');
    res.json({
      message: 'Debug: All appointments in database',
      count: allAppointments.length,
      appointments: allAppointments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const allUsers = await User.find({}, 'name email role');
    res.json({
      message: 'Debug: All users in database',
      count: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});