const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctor, date, time } = req.body;
    const patient = req.user.id;

    console.log('Booking appointment:', { doctor, date, time, patient });

    if (!doctor || !date || !time) {
      return res.status(400).json({ message: 'Doctor, date, and time are required' });
    }

    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }

    const patientUser = await User.findById(patient);
    if (!patientUser) {
      return res.status(400).json({ message: 'Invalid patient' });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      date,
      time,
      status: 'pending'
    });

    await appointment.save();
    console.log('Appointment saved successfully:', appointment._id);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment: populatedAppointment 
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    console.log('=== GET APPOINTMENTS CALLED ===');
    console.log('Request user:', req.user);
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);
    
    let appointments;
    
    if (req.user.role === 'admin') {
      console.log('Admin user - fetching all appointments');
      appointments = await Appointment.find().populate('patient doctor', 'name email role');
    } else if (req.user.role === 'doctor') {
      console.log('Doctor user - fetching appointments for doctor ID:', req.user.id);
      appointments = await Appointment.find({ doctor: req.user.id }).populate('patient doctor', 'name email role');
    } else {
      console.log('Patient user - fetching appointments for patient ID:', req.user.id);
      appointments = await Appointment.find({ patient: req.user.id }).populate('patient doctor', 'name email role');
    }
    
    console.log('=== DATABASE QUERY RESULTS ===');
    console.log('Found appointments in DB:', appointments.length);
    console.log('Appointments:', appointments);
    
    if (appointments.length > 0) {
      console.log('First appointment structure:', {
        id: appointments[0]._id,
        patient: appointments[0].patient,
        doctor: appointments[0].doctor,
        date: appointments[0].date,
        time: appointments[0].time,
        status: appointments[0].status
      });
    }
    
    const now = new Date();
    console.log('Current time for categorization:', now);
    
    const categorized = appointments.reduce((acc, appt) => {
      const apptDateTime = new Date(appt.date + 'T' + appt.time);
      console.log(`Appointment ${appt._id}: ${appt.date} ${appt.time} -> ${apptDateTime} (future: ${apptDateTime >= now})`);
      
      if (appt.status === 'cancelled') {
        acc.cancelled.push(appt);
      } else if (appt.status === 'completed') {
        acc.completed.push(appt);
      } else if (apptDateTime >= now) {
        acc.upcoming.push(appt);
      } else {
        acc.past.push(appt);
      }
      
      return acc;
    }, { upcoming: [], past: [], completed: [], cancelled: [] });

    const response = { 
      appointments,
      categorized,
      summary: {
        total: appointments.length,
        upcoming: categorized.upcoming.length,
        past: categorized.past.length,
        completed: categorized.completed.length,
        cancelled: categorized.cancelled.length
      }
    };
    
    console.log('=== SENDING RESPONSE ===');
    console.log('Response structure:', response);
    console.log('Appointments count in response:', response.appointments.length);
    
    res.json(response);
  } catch (err) {
    console.error('=== ERROR IN GET APPOINTMENTS ===');
    console.error('Error details:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find({ status: { $nin: ['cancelled', 'completed'] } })
        .populate('patient doctor', 'name email role')
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ 
        doctor: req.user.id, 
        status: { $nin: ['cancelled', 'completed'] } 
      })
        .populate('patient doctor', 'name email role')
        .sort({ date: 1, time: 1 });
    } else {
      appointments = await Appointment.find({ 
        patient: req.user.id, 
        status: { $nin: ['cancelled', 'completed'] } 
      })
        .populate('patient doctor', 'name email role')
        .sort({ date: 1, time: 1 });
    }

    const now = new Date();
    const upcoming = appointments.filter(appt => {
      const apptDateTime = new Date(appt.date + 'T' + appt.time);
      return apptDateTime >= now;
    });

    res.json({ upcoming, count: upcoming.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 