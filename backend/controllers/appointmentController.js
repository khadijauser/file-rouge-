const Appointment = require('../models/Appointment');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.bookAppointment = async (req, res) => {
  try {
    const { doctor, date, time } = req.body;
    const patient = req.user.id;

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
    const appointmentDate = new Date(date);
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (appointmentDateTime < now) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    const appointment = new Appointment({
      patient,
      doctor,
      date,
      time,
      status: 'pending'
    });

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      appointment: populatedAppointment 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find().populate('patient doctor', 'name email role phone');
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user.id }).populate('patient doctor', 'name email role phone');
    } else {
      appointments = await Appointment.find({ patient: req.user.id }).populate('patient doctor', 'name email role phone');
    }
    
    const now = new Date();
    const pastPendingAppointments = [];
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const categorized = appointments.reduce((acc, appt) => {
      const apptDateTime = new Date(appt.date + 'T' + appt.time);
      
      if (appt.status === 'cancelled') {
        const updatedAt = new Date(appt.updatedAt);
        if (updatedAt >= thirtyDaysAgo) {
          acc.cancelled.push(appt);
        }
      } else if (appt.status === 'completed') {
        acc.completed.push(appt);
      } else if (apptDateTime >= now) {
        acc.upcoming.push(appt);
      } else {
        if (appt.status === 'pending' || appt.status === 'confirmed') {
          pastPendingAppointments.push(appt._id);
          appt.status = 'completed';
          acc.completed.push(appt);
        } else {
          acc.past.push(appt);
        }
      }
      
      return acc;
    }, { upcoming: [], past: [], completed: [], cancelled: [] });
    
    if (pastPendingAppointments.length > 0) {
      await Appointment.updateMany(
        { _id: { $in: pastPendingAppointments } },
        { $set: { status: 'completed' } }
      );
    }

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
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find({ status: { $nin: ['cancelled', 'completed'] } })
        .populate('patient doctor', 'name email role phone')
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ 
        doctor: req.user.id, 
        status: { $nin: ['cancelled', 'completed'] } 
      })
        .populate('patient doctor', 'name email role phone')
        .sort({ date: 1, time: 1 });
    } else {
      appointments = await Appointment.find({ 
        patient: req.user.id, 
        status: { $nin: ['cancelled', 'completed'] } 
      })
        .populate('patient doctor', 'name email role phone')
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

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient doctor', 'name email role phone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (
      req.user.role !== 'admin' &&
      appointment.patient._id.toString() !== req.user.id &&
      appointment.doctor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ appointment });
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
    
    if (
      req.user.role !== 'admin' &&
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    appointment.status = status;
    
    if (status === 'cancelled') {
      appointment.updatedAt = new Date();
    }
    
    await appointment.save();
    
    res.json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { doctor, date, time, notes } = req.body;
    
    if (!doctor || !date || !time) {
      return res.status(400).json({ message: 'Doctor, date, and time are required' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.patient && req.user && req.user.id && 
        appointment.patient.toString() !== req.user.id.toString() && 
        req.user.role !== 'admin') {
      console.log('Permission denied:', { 
        appointmentPatient: appointment.patient ? appointment.patient.toString() : 'undefined', 
        requestUserId: req.user.id ? req.user.id.toString() : 'undefined',
        userRole: req.user.role 
      });
      return res.status(403).json({ message: 'Access denied: You can only update your own appointments' });
    }
    
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot update a ${appointment.status} appointment` });
    }
    
    const appointmentDate = new Date(date);
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (appointmentDateTime < now) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }
    
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(400).json({ message: 'Invalid doctor' });
    }
    
    appointment.doctor = doctor;
    appointment.date = date;
    appointment.time = time;
    appointment.notes = notes || '';
    
    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient doctor', 'name email phone');
    
    res.json({ 
      message: 'Appointment updated successfully', 
      appointment: populatedAppointment 
    });
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